document.addEventListener('DOMContentLoaded', function () {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  document.querySelector('#compose-form').onsubmit = send_mail;

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox) {

  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  if (mailbox === 'inbox') {

    load_inbox(mailbox);

  } else if (mailbox === 'sent') {

    load_sentbox(mailbox);

  } else if (mailbox === 'archive') {
    load_archivebox(mailbox);
  }

  observe_change(mailbox)

}

function load_inbox(mailbox) {

  fetch(`/emails/${mailbox}`)
    .then(response => response.json())
    .then(mails_from_inbox => {
      if (mails_from_inbox.length === 0) {

        const message_element = document.createElement('h4')
        message_element.innerText = "No Messages!"
        document.querySelector("#emails-view").append(message_element)

      } else {
        create_and_style_email(mails_from_inbox, mailbox);
      }
    })
}

function load_sentbox(mailbox) {

  fetch(`/emails/${mailbox}`)
    .then(response => response.json())
    .then(sent_emails => {
      if (sent_emails.length === 0) {

        const message_element = document.createElement('h4')
        message_element.innerText = "No Messages!"
        document.querySelector("#emails-view").append(message_element)

      } else {
        create_and_style_email(sent_emails, mailbox);
      }
    })


}

function load_archivebox(mailbox) {
  fetch(`/emails/${mailbox}`)
    .then(response => response.json())
    .then(archived_emails => {
      if (archived_emails.length === 0) {

        const message_element = document.createElement('h4')
        message_element.innerText = "No Messages archived!"
        document.querySelector("#emails-view").append(message_element)

      } else {
        create_and_style_email(archived_emails, mailbox);
      }
    })
}

function create_and_style_email(mails_list, mailbox) {

  const ul_element = document.createElement('ul')
  mails_list.forEach((mail) => {

    const li_element = document.createElement('li')
    li_element.innerHTML = `
        <div class="box-mail" id=${mail.id} ${mail.read ? "style='background-color: gray; color: white'" : "style='background-color: white'"}>
          <div> 
           <span class="sender">${mailbox === "sent" ? mail.recipients : mail.sender}</span>
            <span class="subject">${mail.subject}</span>
          </div>
          <span class="timestamp" ${mail.read ? "style='color: white'" : ''}>${mail.timestamp}</span>
        </div>
            `
    ul_element.append(li_element)
    ul_element.classList.add('mail_lists')
  })
  document.querySelector('#emails-view').append(ul_element)

}

function observe_change(mailbox) {
  const observer = new MutationObserver((mutationsList) => {
    const box_mail = document.querySelectorAll('.box-mail')
    mutationsList.forEach((mutation) => {

      if (box_mail) {
        console.log("the element exist now!!")
        console.log(box_mail)
        box_mail.forEach((box) => {
          box.addEventListener('click', () => {
            console.log("id of this element ", box.id)
            console.log("has been clicked!!")
            document.querySelector('.mail_lists').style.display = "none";
            load_email_by_id(mailbox, box.id)
            change_the_read_status_of_mail(box.id)

          })
        })

      }
    });
    observer.disconnect();
  });

  observer.observe(document.body, { childList: true, subtree: true });
}


function load_email_by_id(mailbox, mail_id) {
  const mail_container = document.createElement('div')
  mail_container.classList.add('mail-container')

  fetch(`/emails/${mail_id}`)
    .then(response => response.json())
    .then(email => {
      mail_container.innerHTML = `
      <span> <strong>From: </strong> ${email.sender} </span>
      <span> <strong>To: </strong> ${email.recipients} </span>
      <span> <strong>Subject: </strong> ${email.subject} </span>
      <span> <strong>Timestamp: </strong> ${email.timestamp} </span>
      <div class="interactions-btns">
        <button> Reply </button>
      </div>
      <hr>
      <p>${email.body} </p>
      `
      document.querySelector('#emails-view').append(mail_container)
      if (mailbox !== "sent") {
        archive_and_unarchive_the_mail(mailbox, mail_id)
      }
      console.log(email)
    })
}

//once clicked on a mail in the inbox view, 
// change the status of message to read=true
function change_the_read_status_of_mail(mail_id) {
  fetch(`/emails/${mail_id}`, {
    method: 'PUT',
    body: JSON.stringify({
      read: true
    })
  })
}

function archive_and_unarchive_the_mail(mailbox, mail_id) {
  const archive_btn = document.createElement('button')
  archive_btn.textContent = `${mailbox === "inbox" ? "Archive" : "Unarchive"}`
  archive_btn.classList.add('archive-mail')
  document.querySelector('.interactions-btns').append(archive_btn)

  const archive = document.querySelector('.archive-mail')

  archive.addEventListener('click', () => {
    fetch(`/emails/${mail_id}`, {
      method: 'PUT',
      body: JSON.stringify({
        archived: mailbox === "inbox" ? true : false
      })

    })
      .then(()=> {
        document.querySelector('.mail-container').style.display = "none";
        load_mailbox('inbox')
      })

  })

}

function send_mail() {

  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
      recipients: `${document.querySelector('#compose-recipients').value}`,
      subject: `${document.querySelector('#compose-subject').value}`,
      body: `${document.querySelector('#compose-body').value}`
    })
  })
    .then(response => response.json())
    .then(result => {

      load_mailbox('sent');
      console.log("hier is the result!");
      console.log(result);
    })
    .catch(error => {
      console.log('Error:', error);
    });

  return false;
}

