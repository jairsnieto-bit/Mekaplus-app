const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const logAudit = async (action, table, recordId, userId, details = null) => {
  try {
    await prisma.auditLog.create({
      data: {
        action,
        table,
        recordId,
        userId,
        details
      }
    });
  } catch (error) {
    console.error('Error creating audit log:', error);
  }
};

const setupAuditLog = () => {
  console.log('Audit logging system initialized');
};

module.exports = { logAudit, setupAuditLog };