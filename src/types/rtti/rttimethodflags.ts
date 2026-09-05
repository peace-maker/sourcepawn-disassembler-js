export enum RttiMethodFlags {
  VisibilityMask = 0x3,
  VisibilityPrivate = 0x0,
  VisibilityPublic = 0x1,
  Native = 0x4,
  Closure = 0x8,
  HasUpvars = 0x10,
  Ctor = 0x20,
}
