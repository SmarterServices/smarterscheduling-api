'use strict';

const applicationInstallIntegration = {
  foreignKey: 'installIntegrationSid'
};

const cancellationPolicy = {
  foreignKey: 'cancellationPolicySid'
};

const courseOffering = {
  foreignKey: 'courseOfferingSid'
};

const enrollment = {
  foreignKey: 'enrollmentSid'
};

const enrollmentSupportTicket = {
  foreignKey: 'ticketSid'
};

const examConfiguration = {
  foreignKey: 'examConfigurationSid'
};

const examSessionEventReport = {
  foreignKey: 'examSessionEventReportSid'
};

const exportProcesses = {
  foreignKey: 'exportProcessesSid'
};

const fundingRule = {
  foreignKey: 'fundingRuleSid'
};

const proctorAccountLocationAvailability = {
  foreignKey: 'proctorLocationAvailabilitySid'
};

const proctorExportProcesses = {
  foreignKey: 'proctorExportProcessesSid'
};

const proctorGroup = {
  foreignKey: 'proctorGroupSid'
};

const proctorAccountPayment = {
  foreignKey: 'proctorAccountPaymentSid'
};

const proctorAccountSupportTicket = {
  foreignKey: 'proctorAccountSupportTicketSid'
};

const proctorApprovals = {
  foreignKey: 'approvalSid'
};

const schedulingBlackoutDate = {
  foreignKey: 'blackoutDateSid'
};

const userAccommodation = {
  foreignKey: 'userAccommodationSid'
};

const voucher = {
  foreignKey: 'voucherSid'
};

const course = {
  foreignKey: 'courseSid',
  children: {
    enrollment: {relation: enrollment}
  }
};

const examSession = {
  foreignKey: 'examSessionSid',
  children: {
    examSessionEventReport: {relation: examSessionEventReport}
  }
};

const exam = {
  foreignKey: 'examSid',
  children: {
    examConfiguration: {relation: examConfiguration},
    examSession: {relation: examSession}
  }
};

const proctorAccountLocation = {
  foreignKey: 'proctorLocationSid',
  children: {
    proctorAccountLocationAvailability: {relation: proctorAccountLocationAvailability}
  }
};

const proctorAccountUser = {
  foreignKey: 'proctorAccountUserSid',
  children: {
    proctorExportProcesses: {relation: proctorExportProcesses}
  }
};

const user = {
  foreignKey: 'userSid',
  children: {
    enrollment: {relation: enrollment},
    exportProcesses: {relation: exportProcesses},
    userAccommodation: {relation: userAccommodation}
  }
};

const appInstall = {
  foreignKey: 'applicationInstallSid',
  children: {
    applicationInstallIntegration: {relation: applicationInstallIntegration},
    exam: {relation: exam},
    exportProcesses: {relation: exportProcesses},
    enrollmentSupportTicket: {relation: enrollmentSupportTicket},
    fundingRule: {relation: fundingRule},
    proctorApprovals: {relation: proctorApprovals},
    proctorGroup: {relation: proctorGroup},
    schedulingBlackoutDate: {relation: schedulingBlackoutDate},
    voucher: {relation: voucher}
  }
};

const relations = {
  accountDeployment: {
    foreignKey: 'deploymentSid',
    children: {
      appInstall: {relation: appInstall},
      course: {relation: course},
      user: {relation: user},
      courseOffering: {relation: courseOffering}
    }
  },
  proctorAccount: {
    foreignKey: 'proctorAccountSid',
    children: {
      cancellationPolicy: {relation: cancellationPolicy},
      proctorAccountLocation: {relation: proctorAccountLocation},
      proctorAccountPayment: {relation: proctorAccountPayment},
      proctorAccountSupportTicket: {relation: proctorAccountSupportTicket},
      proctorAccountUser: {relation: proctorAccountUser},
      proctorExportProcesses: {relation: proctorExportProcesses}
    }
  },
  messageThread: {
    foreignKey: 'messageSid'
  },
  proctorLocationType: {
    foreignKey: 'locationTypeSid'
  },
  currency: {
    primaryKey: 'code',
    foreignKey: 'currencyCode'
  }
};

module.exports = relations;
