import { EMAIL_HOST, EMAIL_PORT, EMAIL_SENDER, FRONTEND_URL } from "../config"

const uuid = require("uuid")
const nodemailer = require("nodemailer")

const transporter = nodemailer.createTransport({
  host: EMAIL_HOST,
  port: EMAIL_PORT,
  secure: false,
})

async function email(attachments: any[], receivers: string, subject: string, content: string) {
  const message = {
    from: EMAIL_SENDER,
    to: receivers,
    subject: subject,
    text: "",
    html: content,
    attachments: attachments,
  }
  return transporter.sendMail(message).catch((e: any) => {
    console.log("Email Error", e)
  })
}

function generateAttachment(buf: Buffer, fileName: string) {
  const attachmentId = uuid.v4()
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
     <br><b>Hello ${receiverName.replace(".", " ")},</b><br><br>
     <p>Please find attached the following file related to a Journal in the Recoveries App:</p>
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
  recoveryId: number,
  items: { category: string }[]
) {
  console.log("ITEMS", items)

  const itemList = items
    .map((item) => {
      return `<li>${item.category}</li>`
    })
    .join("")

  return `<i>Department of ${receiverDept}</i>
    <br><b>Hello ${receiverName.replace(".", " ")},</b><br><br>
    <p>A recovery request has been created and is pending your approval for the following items:</p>
    ${itemList}
    <p>Please sign in to review <a href='${FRONTEND_URL}/recoveries/${recoveryId}'>this recovery</a> in the Recoveries App.</p>
    <br>Thank you!`
}

export async function sendPendingApprovalEmail(
  addReminder: boolean,
  senderName: string,
  sender: string,
  receivers: string,
  receiverName: string,
  receiverDept: string,
  recoveryId: number,
  items: { category: string }[]
) {
  const attachments: any[] = []
  const reminder = addReminder ? "(Reminder) " : ""
  const subject = `${reminder}Recoveries Pending Approval`
  const content = generatePendingApprovalContent(
    senderName,
    sender,
    receiverName,
    receiverDept,
    recoveryId,
    items
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
        ${senderName.replace(".", " ")} (${sender}) ${approval} purchase of the items in recovery <strong>${reference}</strong>.
        <br><br>
        ${comments}
        <br/><br/>
        <p>Please sign in to review <a href='${FRONTEND_URL}/recoveries/${recoveryId}'>this recovery</a> in the Recoveries App.</p>
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
