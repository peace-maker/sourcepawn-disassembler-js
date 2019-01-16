import { V1Disassembler } from './disassembly/v1disassembler';
import { FileHeader } from './fileheader';
import { SectionEntry } from './sectionentry';
import { SmxDebugGlobalsTable } from './sections/rtti/smxdebugglobalstable';
import { SmxDebugLocalsTable } from './sections/rtti/smxdebuglocalstable';
import { SmxDebugMethodTable } from './sections/rtti/smxdebugmethodstable';
import { SmxRttiClassDefTable } from './sections/rtti/smxrtticlassdeftable';
import { SmxRttiDataSection } from './sections/rtti/smxrttidatasection';
import { SmxRttiEnumStructFieldTable } from './sections/rtti/smxrttienumstructfieldstable';
import { SmxRttiEnumStructTable } from './sections/rtti/smxrttienumstructstable';
import { SmxRttiEnumTable } from './sections/rtti/smxrttienumtable';
import { SmxRttiFieldTable } from './sections/rtti/smxrttifieldstable';
import { SmxRttiMethodTable } from './sections/rtti/smxrttimethodstable';
import { SmxRttiNativeTable } from './sections/rtti/smxrttinativestable';
import { SmxRttiTypedefTable } from './sections/rtti/smxrttitypedefstable';
import { SmxRttiTypesetTable } from './sections/rtti/smxrttitypesettable';
import { SmxCalledFunctionTable } from './sections/smxcalledfunctiontable';
import { SmxCodeV1Section } from './sections/smxcodev1section';
import { SmxDataSection } from './sections/smxdatasection';
import { SmxDebugFileTable } from './sections/smxdebugfilestable';
import { SmxDebugInfoSection } from './sections/smxdebuginfosection';
import { SmxDebugLineTable } from './sections/smxdebuglinetable';
import { SmxDebugNativeTable } from './sections/smxdebugnativetable';
import { SmxLegacyDebugSymbolTable } from './sections/smxlegacydebugsymboltable';
import { SmxNameTable } from './sections/smxnametable';
import { SmxNativeTable } from './sections/smxnativetable';
import { SmxPublicTable } from './sections/smxpublictable';
import { SmxPubvarTable } from './sections/smxpubvartable';
import { SmxTagTable } from './sections/smxtagtable';
import { SymKind } from './types/symkind';

export class SourcePawnFile {
  public header!: FileHeader;

  public names!: SmxNameTable;
  public debugNames!: SmxNameTable;
  public debugInfo!: SmxDebugInfoSection;

  public natives!: SmxNativeTable;
  public publics!: SmxPublicTable;
  public pubvars!: SmxPubvarTable;
  public tags!: SmxTagTable;

  public data!: SmxDataSection;
  public code!: SmxCodeV1Section;
  public calledFunctions!: SmxCalledFunctionTable;

  public debugFiles!: SmxDebugFileTable;
  public debugLines!: SmxDebugLineTable;
  public debugNatives!: SmxDebugNativeTable;
  public debugSymbols!: SmxLegacyDebugSymbolTable;

  public debugMethods!: SmxDebugMethodTable;
  public debugGlobals!: SmxDebugGlobalsTable;
  public debugLocals!: SmxDebugLocalsTable;
  public rttiData!: SmxRttiDataSection;
  public rttiClassDefs!: SmxRttiClassDefTable;
  public rttiEnums!: SmxRttiEnumTable;
  public rttiEnumStructs!: SmxRttiEnumStructTable;
  public rttiEnumStructFields!: SmxRttiEnumStructFieldTable;
  public rttiFields!: SmxRttiFieldTable;
  public rttiMethods!: SmxRttiMethodTable;
  public rttiNatives!: SmxRttiNativeTable;
  public rttiTypedefs!: SmxRttiTypedefTable;
  public rttiTypesets!: SmxRttiTypesetTable;

  public unknownSections!: SectionEntry[];

  private bytes!: ArrayBuffer;

  public constructor(buffer: ArrayBuffer) {
    this.OnFileLoaded(buffer);
  }

  public findGlobalName(address: number): string | null {
    // New rtti debug symbols.
    if (this.debugGlobals != null) {
      const sym = this.debugGlobals.findGlobal(address);
      if (sym != null) {
        return sym.name;
      }
    }

    // Legacy debug symbols.
    if (this.debugSymbols != null) {
      const sym = this.debugSymbols.findDataRef(address);
      if (sym != null) {
        return sym.name;
      }
    }

    return null;
  }

  public findLocalName(codeaddr: number, address: number): string | null {
    // New rtti debug symbols.g
    if (this.debugLocals != null) {
      const sym = this.debugLocals.findLocal(codeaddr, address);
      if (sym != null) {
        return sym.name;
      }
    }

    // Legacy debug symbols.
    if (this.debugSymbols != null) {
      const sym = this.debugSymbols.findStackRef(codeaddr, address);
      if (sym != null) {
        return sym.name;
      }
    }

    return null;
  }

  public findFunctionName(address: number): string {
    // Legacy symbols.
    if (this.debugSymbols != null) {
      const entry = this.debugSymbols.findFunction(address);
      if (entry != null) {
        return entry.name;
      }
    }

    // Check if the function is in the .publics table.
    // All functions are added to the table since SM 1.8, even if they
    // don't have the "public" modifier.
    if (this.publics != null) {
      for (const pubfun of this.publics.entries) {
        if (pubfun.address === address) {
          return pubfun.name;
        }
      }
    }

    // Check if this function was called somewhere in the code.
    if (this.calledFunctions != null) {
      for (const callfun of this.calledFunctions.functions) {
        if (callfun.address === address) {
          return callfun.name;
        }
      }
    }
    return '(unknown)';
  }

  public functionExists(address: number): boolean {
    // Legacy symbols.
    if (this.debugSymbols != null) {
      const entry = this.debugSymbols.findFunction(address);
      return entry != null;
    }

    // Check if the function is in the .publics table.
    // All functions are added to the table since SM 1.8, even if they
    // don't have the "public" modifier.
    if (this.publics != null) {
      for (const pubfun of this.publics.entries) {
        if (pubfun.address === address) {
          return true;
        }
      }
    }

    // Check if this function was called somewhere in the code.
    if (this.calledFunctions != null) {
      for (const callfun of this.calledFunctions.functions) {
        if (callfun.address === address) {
          return true;
        }
      }
    }
    return false;
  }

  private OnFileLoaded(data: ArrayBuffer): any {
    this.bytes = data;
    this.header = new FileHeader(this.bytes);

    // Parse precursor sections.
    for (const section of this.header.sections) {
      if (section.name === '.names') {
        this.names = new SmxNameTable(this.header, section);
      } else if (section.name === '.dbg.strings') {
        this.debugNames = new SmxNameTable(this.header, section);
      } else if (section.name === '.dbg.info') {
        this.debugInfo = new SmxDebugInfoSection(this.header, section);
      }
    }

    // Catch the tags section first.
    for (const section of this.header.sections) {
      if (section.name === '.tags') {
        this.tags = new SmxTagTable(this.header, section, this.names);
        break;
      }
    }

    // Track which functions were called in the code.
    // Finds functions missing from the debug sections.
    this.calledFunctions = new SmxCalledFunctionTable();

    // .dbg.names was removed when RTTI was added.
    if (this.debugNames == null) {
      this.debugNames = this.names;
    }

    // Parse out other sections
    this.unknownSections = [];
    for (const section of this.header.sections) {
      switch (section.name) {
        case '.names':
        case '.dbg.strings':
        case '.dbg.info':
          break;
        case '.natives':
          this.natives = new SmxNativeTable(this.header, section, this.names);
          break;
        case '.publics':
          this.publics = new SmxPublicTable(this.header, section, this.names);
          break;
        case '.pubvars':
          this.pubvars = new SmxPubvarTable(this.header, section, this.names);
          break;
        case '.data':
          this.data = new SmxDataSection(this.header, section);
          break;
        case '.code':
          this.code = new SmxCodeV1Section(this.header, section);
          break;
        case '.dbg.files':
          this.debugFiles = new SmxDebugFileTable(this.header, section, this.debugNames);
          break;
        case '.dbg.lines':
          this.debugLines = new SmxDebugLineTable(this.header, section);
          break;
        case '.dbg.natives':
          this.debugNatives = new SmxDebugNativeTable(this.header, section, this.debugNames, this.tags);
          break;
        case '.dbg.symbols':
          this.debugSymbols = new SmxLegacyDebugSymbolTable(this.header, section, this.debugInfo, this.debugNames);
          break;
        case '.dbg.methods':
          this.debugMethods = new SmxDebugMethodTable(this.header, section);
          break;
        case '.dbg.globals':
          this.debugGlobals = new SmxDebugGlobalsTable(this.header, section, this.names);
          break;
        case '.dbg.locals':
          this.debugLocals = new SmxDebugLocalsTable(this, this.header, section, this.names);
          break;
        case 'rtti.data':
          this.rttiData = new SmxRttiDataSection(this, this.header, section);
          break;
        case 'rtti.classdefs':
          this.rttiClassDefs = new SmxRttiClassDefTable(this.header, section, this.names);
          break;
        case 'rtti.enums':
          this.rttiEnums = new SmxRttiEnumTable(this.header, section, this.names);
          break;
        case 'rtti.enumstructs':
          this.rttiEnumStructs = new SmxRttiEnumStructTable(this.header, section, this.names);
          break;
        case 'rtti.enumstructs_fields':
          this.rttiEnumStructFields = new SmxRttiEnumStructFieldTable(this.header, section, this.names);
          break;
        case 'rtti.fields':
          this.rttiFields = new SmxRttiFieldTable(this.header, section, this.names);
          break;
        case 'rtti.methods':
          this.rttiMethods = new SmxRttiMethodTable(this.header, section, this.names);
          break;
        case 'rtti.natives':
          this.rttiNatives = new SmxRttiNativeTable(this.header, section, this.names);
          break;
        case 'rtti.typedefs':
          this.rttiTypedefs = new SmxRttiTypedefTable(this.header, section, this.names);
          break;
        case 'rtti.typedefs':
          this.rttiTypesets = new SmxRttiTypesetTable(this.header, section, this.names);
          break;
        default:
          this.unknownSections.push(section);
          break;
      }
    }

    // Disassemble all functions right away to find all called functions.
    const disassembledFunctions = [];
    if (this.debugSymbols != null) {
      for (const sym of this.debugSymbols.entries) {
        if (sym.ident !== SymKind.Function) {
          continue;
        }
        if (sym.address in disassembledFunctions) {
          continue;
        }
        disassembledFunctions.push(sym.address);
        V1Disassembler.Disassemble(this, sym.address);
      }
    }

    if (this.publics != null) {
      for (const pubfun of this.publics.entries) {
        if (pubfun.address in disassembledFunctions) {
          continue;
        }
        disassembledFunctions.push(pubfun.address);
        V1Disassembler.Disassemble(this, pubfun.address);
      }
    }

    if (this.calledFunctions != null) {
      for (const fun of this.calledFunctions.functions) {
        if (fun.address in disassembledFunctions) {
          continue;
        }
        disassembledFunctions.push(fun.address);
        V1Disassembler.Disassemble(this, fun.address);
      }
    }
  }
}
