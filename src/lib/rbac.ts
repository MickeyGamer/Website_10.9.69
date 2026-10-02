export const ROLES = {
  USER: "USER",
  CREATOR: "CREATOR",
  SELLER: "SELLER",
  CHAT_ADMIN: "CHAT_ADMIN",
  BACKOFFICE_ADMIN: "BACKOFFICE_ADMIN",
  CONTENT_ADMIN: "CONTENT_ADMIN",
  PRODUCT_ADMIN: "PRODUCT_ADMIN",
  SUPER_ADMIN: "SUPER_ADMIN",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

/**
 * Permission คือสิทธิ์ย่อยที่ใช้ตรวจสอบการกระทำแต่ละอย่าง
 */
export const PERMISSIONS = {
  // สิทธิ์เข้าระบบหลังบ้าน
  ADMIN_ACCESS: "admin.access",

  // ระบบแชทลูกค้า
  CHAT_READ: "chat.read",
  CHAT_REPLY: "chat.reply",

  // ระบบบทความ
  ARTICLE_READ_ADMIN: "article.read.admin",
  ARTICLE_CREATE: "article.create",
  ARTICLE_UPDATE_OWN: "article.update.own",
  ARTICLE_DELETE_OWN: "article.delete.own",
  ARTICLE_UPDATE_ANY: "article.update.any",
  ARTICLE_DELETE_ANY: "article.delete.any",

  // ระบบสินค้า
  PRODUCT_READ_ADMIN: "product.read.admin",
  PRODUCT_CREATE: "product.create",
  PRODUCT_UPDATE_OWN: "product.update.own",
  PRODUCT_DELETE_OWN: "product.delete.own",
  PRODUCT_UPDATE_ANY: "product.update.any",
  PRODUCT_DELETE_ANY: "product.delete.any",

  // ระบบหมวดหมู่
  CATEGORY_READ: "category.read",
  CATEGORY_CREATE: "category.create",
  CATEGORY_UPDATE: "category.update",
  CATEGORY_DELETE: "category.delete",

  // ระบบคำสั่งซื้อ
  ORDER_READ_OWN: "order.read.own",
  ORDER_READ_ANY: "order.read.any",
  ORDER_UPDATE_ANY: "order.update.any",
  ORDER_CANCEL_ANY: "order.cancel.any",

  // ระบบชำระเงิน
  PAYMENT_READ_ANY: "payment.read.any",
  PAYMENT_VERIFY: "payment.verify",
  PAYMENT_REJECT: "payment.reject",

  // ระบบจัดส่ง
  SHIPPING_READ_ANY: "shipping.read.any",
  SHIPPING_UPDATE_ANY: "shipping.update.any",

  // ระบบผู้ใช้งาน
  USER_READ: "user.read",
  USER_UPDATE: "user.update",
  USER_SUSPEND: "user.suspend",
  USER_DELETE: "user.delete",

  // ระบบ Role
  ROLE_READ: "role.read",
  ROLE_MANAGE: "role.manage",

  // ประวัติการทำงานของ Admin
  AUDIT_LOG_READ: "audit-log.read",
} as const;

export type Permission =
  (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

/**
 * จับคู่ Role กับ Permission
 *
 * ผู้ใช้งานหนึ่งบัญชีสามารถมีได้หลาย Role เช่น:
 * roles: ["CHAT_ADMIN", "BACKOFFICE_ADMIN"]
 */
export const ROLE_PERMISSIONS: Record<Role, readonly Permission[]> = {
  /**
   * ผู้ใช้งานทั่วไป
   * ไม่มีสิทธิ์เข้าหลังบ้าน แก้ไขบทความ หรือลบสินค้า
   */
  USER: [PERMISSIONS.ORDER_READ_OWN],

  /**
   * ผู้สร้างบทความ
   * จัดการได้เฉพาะบทความที่ตนเองเป็นเจ้าของ
   */
  CREATOR: [
    PERMISSIONS.ARTICLE_CREATE,
    PERMISSIONS.ARTICLE_UPDATE_OWN,
    PERMISSIONS.ARTICLE_DELETE_OWN,
  ],

  /**
   * เจ้าของสินค้า
   * จัดการได้เฉพาะสินค้าที่ตนเองเป็นเจ้าของ
   */
  SELLER: [
    PERMISSIONS.PRODUCT_CREATE,
    PERMISSIONS.PRODUCT_UPDATE_OWN,
    PERMISSIONS.PRODUCT_DELETE_OWN,
    PERMISSIONS.ORDER_READ_OWN,
  ],

  /**
   * แอดมินตอบแชทลูกค้า
   * เข้าได้เฉพาะส่วนแชท
   */
  CHAT_ADMIN: [
    PERMISSIONS.ADMIN_ACCESS,
    PERMISSIONS.CHAT_READ,
    PERMISSIONS.CHAT_REPLY,
  ],

  /**
   * แอดมินหลังบ้าน
   * ดูแลคำสั่งซื้อ การชำระเงิน และการจัดส่ง
   */
  BACKOFFICE_ADMIN: [
    PERMISSIONS.ADMIN_ACCESS,
    PERMISSIONS.ORDER_READ_ANY,
    PERMISSIONS.ORDER_UPDATE_ANY,
    PERMISSIONS.ORDER_CANCEL_ANY,
    PERMISSIONS.PAYMENT_READ_ANY,
    PERMISSIONS.PAYMENT_VERIFY,
    PERMISSIONS.PAYMENT_REJECT,
    PERMISSIONS.SHIPPING_READ_ANY,
    PERMISSIONS.SHIPPING_UPDATE_ANY,
  ],

  /**
   * แอดมินดูแลบทความ
   * สามารถจัดการบทความทั้งหมดและหมวดหมู่บทความ
   */
  CONTENT_ADMIN: [
    PERMISSIONS.ADMIN_ACCESS,
    PERMISSIONS.ARTICLE_READ_ADMIN,
    PERMISSIONS.ARTICLE_CREATE,
    PERMISSIONS.ARTICLE_UPDATE_ANY,
    PERMISSIONS.ARTICLE_DELETE_ANY,
    PERMISSIONS.CATEGORY_READ,
    PERMISSIONS.CATEGORY_CREATE,
    PERMISSIONS.CATEGORY_UPDATE,
    PERMISSIONS.CATEGORY_DELETE,
  ],

  /**
   * แอดมินดูแลสินค้า
   * สามารถเพิ่ม แก้ไข และลบสินค้าทั้งหมด
   */
  PRODUCT_ADMIN: [
    PERMISSIONS.ADMIN_ACCESS,
    PERMISSIONS.PRODUCT_READ_ADMIN,
    PERMISSIONS.PRODUCT_CREATE,
    PERMISSIONS.PRODUCT_UPDATE_ANY,
    PERMISSIONS.PRODUCT_DELETE_ANY,
    PERMISSIONS.CATEGORY_READ,
    PERMISSIONS.CATEGORY_CREATE,
    PERMISSIONS.CATEGORY_UPDATE,
    PERMISSIONS.CATEGORY_DELETE,
  ],

  /**
   * ผู้ดูแลระบบสูงสุด
   * มี Permission ทั้งหมด
   */
  SUPER_ADMIN: Object.values(PERMISSIONS) as Permission[],
};

/**
 * ตรวจสอบว่าผู้ใช้มี Permission ที่กำหนดหรือไม่
 */
export function hasPermission(
  roles: readonly Role[] | undefined,
  permission: Permission
): boolean {
  if (!roles?.length) {
    return false;
  }

  return roles.some((role) => {
    const permissions = ROLE_PERMISSIONS[role];

    if (!permissions) {
      return false;
    }

    return permissions.includes(permission);
  });
}

/**
 * ตรวจสอบว่าผู้ใช้มีอย่างน้อยหนึ่ง Permission
 */
export function hasAnyPermission(
  roles: readonly Role[] | undefined,
  permissions: readonly Permission[]
): boolean {
  return permissions.some((permission) =>
    hasPermission(roles, permission)
  );
}

/**
 * ตรวจสอบว่าผู้ใช้มี Permission ครบทุกตัว
 */
export function hasAllPermissions(
  roles: readonly Role[] | undefined,
  permissions: readonly Permission[]
): boolean {
  return permissions.every((permission) =>
    hasPermission(roles, permission)
  );
}

/**
 * ตรวจสอบว่าผู้ใช้มี Role ที่กำหนดหรือไม่
 */
export function hasRole(
  roles: readonly Role[] | undefined,
  requiredRole: Role
): boolean {
  return roles?.includes(requiredRole) ?? false;
}

/**
 * ตรวจสอบว่าผู้ใช้มีอย่างน้อยหนึ่ง Role ที่กำหนด
 */
export function hasAnyRole(
  roles: readonly Role[] | undefined,
  requiredRoles: readonly Role[]
): boolean {
  if (!roles?.length) {
    return false;
  }

  return requiredRoles.some((role) => roles.includes(role));
}

/**
 * ตรวจสอบความเป็นเจ้าของข้อมูล
 * ใช้กับบทความ สินค้า หรือคำสั่งซื้อ
 */
export function isResourceOwner(
  ownerId: unknown,
  currentUserId: string | undefined
): boolean {
  if (!ownerId || !currentUserId) {
    return false;
  }

  return String(ownerId) === currentUserId;
}