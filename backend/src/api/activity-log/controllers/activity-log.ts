import { factories } from '@strapi/strapi';

const UID = 'api::activity-log.activity-log';

export default factories.createCoreController(UID, ({ strapi }) => ({
  async create(ctx) {
    const user: any = ctx.state.user;
    if (!user) return ctx.unauthorized('Login required');

    const data = ctx.request.body.data;

    const entry = await strapi.documents(UID).create({
      data: { ...data, users_permissions_user: user.documentId },
    });

    return { data: entry };
  },

  async find(ctx) {
    const user: any = ctx.state.user;
    if (!user) return ctx.unauthorized('Login required');

    const entries = await strapi.documents(UID).findMany({
      filters: { users_permissions_user: { documentId: user.documentId } },
    });

    return { data: entries };
  },

  async findOne(ctx) {
    const user: any = ctx.state.user;
    if (!user) return ctx.unauthorized('Login required');

    const entry = await strapi.documents(UID).findFirst({
      filters: {
        documentId: ctx.params.id,
        users_permissions_user: { documentId: user.documentId },
      },
    });

    if (!entry) return ctx.notFound('Activity log not found');

    return { data: entry };
  },
}));