import { ToastGroupMachineContext as GroupCtx, ToastMachineContext as Ctx, ToastPlacement } from "./toast.types"

export const dom = {
  getDoc: (ctx: Ctx | GroupCtx) => ctx.doc ?? document,
  getGroupPortalId: (ctx: GroupCtx) => `toast-portal--${ctx.uid}`,
  getGroupContainerId: (ctx: GroupCtx, placement: ToastPlacement) => `toast-group-container--${ctx.uid}--${placement}`,

  getToastTitleId: (ctx: Ctx) => `toast-title--${ctx.id}`,
  getRootId: (ctx: Ctx) => `toast--${ctx.id}`,
  getToastContainerId: (ctx: Ctx) => `toast-container--${ctx.id}`,

  getPortalId: (ctx: GroupCtx) => `toast-portal--${ctx.uid}`,
  getPortalEl: (ctx: GroupCtx) => dom.getDoc(ctx).getElementById(dom.getPortalId(ctx)),
  createPortalEl: (ctx: GroupCtx) => {
    const portal = dom.getDoc(ctx).createElement("toast-portal")
    portal.id = dom.getPortalId(ctx)
    return portal
  },
}
