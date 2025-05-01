import {
  EMAILER_USERNAME,
  EMAILER_PASSWORD,
  EMAIL_HOST,
  EMAIL_PORT,
  EMAIL_SENDER,
  FRONTEND_URL,
} from "../config"

const uuid = require("uuid")
const nodemailer = require("nodemailer")

const transporter = nodemailer.createTransport({
  host: EMAIL_HOST,
  port: EMAIL_PORT,
  secure: false,
  /* auth: {
        user: EMAILER_USERNAME,
        pass: EMAILER_PASSWORD
    }, */
  // connectionTimeout: 1000,
})

async function email(attachments: any[], receivers: string, subject: string, content: string) {
  // console.log(receivers)
  // console.log(subject)
  // console.log(content)
  const message = {
    from: EMAIL_SENDER,
    to: receivers, // list of receivers "comma seperated"
    subject: subject,
    text: "",
    html: content,
    attachments: attachments,
  }
  // console.log(message)
  const info = await transporter.sendMail(message).catch((e: any) => {
    console.log("Email Error", e)
  })
  // console.log("Message sent: %s", info.messageId);
  return info
}

function generateAttachment(buf: Buffer, fileName: string) {
  const attachmentId = uuid.v4()
  // console.log(attachmentId)
  // console.log(buf?.toString('base64'))
  return {
    filename: fileName,
    content: Buffer.from(buf?.toString("base64"), "base64"),
    cid: attachmentId,
  }
}

//_________JV__________
//_____________________
function generateJvContent(
  journalID: number,
  senderName: string,
  sender: string,
  receiverName: string,
  receiverDept: string
) {
  return `<i>Department of ${receiverDept}</i>
     <br><b>Dear ${receiverName.replace(".", " ")},</b><br><br>
     <p>Please find attached the following file(s):</p>
     <ul>
        <li>Journal Voucher # ${journalID}.</li>        
     </ul>
     <br>regards,
     <br><b>${senderName.replace(".", " ")}</b>
     <br><b>${sender}</b>`
}

export async function sendJvEmail(
  pdfBuf: Buffer | null,
  journalID: number,
  senderName: string,
  sender: string,
  receivers: string,
  receiverName: string,
  receiverDept: string
) {
  const attachments: any[] = []
  const subject = `Journal Voucher ${journalID}`
  const content = generateJvContent(journalID, senderName, sender, receiverName, receiverDept)
  if (pdfBuf) attachments.push(generateAttachment(pdfBuf, `JournalVoucher${journalID}_.pdf`))
  return await email(attachments, receivers, subject, content).catch(console.error)
}

//___PendingApproval___
//_____________________
function generatePendingApprovalContent(
  senderName: string,
  sender: string,
  receiverName: string,
  receiverDept: string,
  recoveryId: number
) {
  return `<i>Department of ${receiverDept}</i>
    <br><b>Dear ${receiverName.replace(".", " ")},</b><br><br>
    <p>
        Your recoveries request has been created and is pending your approval. 
        Please login to the <a href='${FRONTEND_URL}/recoveries/${recoveryId}'> Recoveries Application </a> 
        and review the requests under 'Pending Approvals'.
        <br>
        If you need any further clarification, please contact me through Email (${sender}).
    </p>
    <br>regards,
    <br><b>${senderName.replace(".", " ")}</b>
    <br><b>${sender}</b>`
}

export async function sendPendingApprovalEmail(
  addReminder: boolean,
  senderName: string,
  sender: string,
  receivers: string,
  receiverName: string,
  receiverDept: string,
  recoveryId: number
) {
  const attachments: any[] = []
  const reminder = addReminder ? "(Reminder) " : ""
  const subject = `${reminder}Recoveries Pending Approval`
  const content = generatePendingApprovalContent(
    senderName,
    sender,
    receiverName,
    receiverDept,
    recoveryId
  )
  return await email(attachments, receivers, subject, content).catch(console.error)
}

//__Purchase Approved__
//_____________________
function generatePurchaseApprovedContent(
  approval: string,
  senderName: string,
  sender: string,
  reference: string,
  receiverDept: string,
  comments: string,
  recoveryId: number
) {
  return `<i>Department of ${receiverDept}</i>   
    <p>
        ${senderName.replace(".", " ")} (${sender}) ${approval} purchase of the items with ref# ${reference}.
        <br>
        ${comments}
    </p>`
}

export async function sendPurchaseApprovedEmail(
  approved: boolean,
  senderName: string,
  sender: string,
  receivers: string,
  reference: string,
  receiverDept: string,
  declineReason: string,
  recoveryId: number
) {
  const attachments: any[] = []
  const approval = approved ? "approved" : "declined"
  const comments = approved ? "" : "<b>Comments:</b><br>" + declineReason
  const subject = `Purchase ${approval} by ${senderName.replace(".", " ")}`
  const content = generatePurchaseApprovedContent(
    approval,
    senderName,
    sender,
    reference,
    receiverDept,
    comments,
    recoveryId
  )
  return await email(attachments, receivers, subject, content).catch(console.error)
}
