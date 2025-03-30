document.addEventListener('DOMContentLoaded', function() {

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

    fetch('/emails/inbox') 
    .then(response => response.json())
    .then(mails_from_inbox => {
      if (mails_from_inbox.length === 0) {

        const message_element = document.createElement('h4')
        message_element.innerText = "No Messages!"
        document.querySelector("#emails-view").append(message_element)

      } else {

        const ul_element = document.createElement('ul')
        mails_from_inbox.forEach((mail) => {
          const li_element = document.createElement('li')
          li_element.innerHTML = `${mail.sender} ${mail.subject} ${mail.timestamp}`
          ul_element.append(li_element)
        })
        document.querySelector("#emails-view").append(ul_element)
      }
    })

  } else if (mailbox === 'sent') {

    const ul_element = document.createElement('ul')

    fetch('/emails/sent')
    .then(response => response.json())
    .then(sent_emails => {
      if (sent_emails.length === 0) {

        const message_element = document.createElement('h4')
        message_element.innerText = "No Messages!"
        document.querySelector("#emails-view").append(message_element)

      } else {
        sent_emails.forEach((mail)=> {
          const li_element = document.createElement('li')
          li_element.innerHTML = `${mail.sender} ${mail.subject} ${mail.timestamp}`  
          ul_element.append(li_element)
        })
      }
    })
    

    document.querySelector('#emails-view').append(ul_element)

  } else if (mailbox === 'archive') {

  }
  
}

function send_mail() {

  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
      recipients:`${document.querySelector('#compose-recipients').value}`,
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