const chatform = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const userList = document.getElementById('users');
const roomName = document.getElementById('room-name');
const usernameForm = document.getElementById('username-form');

// get username and room from url
const roomId = location.pathname.slice(1).toString();
const socket = io();
usernameForm.elements['username'].value = sessionStorage.getItem('userName');
usernameForm.addEventListener('submit', (e) => {
  e.preventDefault();
  let username = e.target.elements['username'].value;
  sessionStorage.setItem('userName', username);
  //join room
  socket.emit('joinRoom', { username, roomId });
  var elements = usernameForm.elements;
  socket.on('noRoom', () => {
    location.pathname = '/';
  });

  //#region hide elements after succesfull submit
  for (var i = 0, len = elements.length; i < len; ++i) {
    elements[i].disabled = true;
  }
  document.getElementById('login-container').style.height = 0;
  usernameForm.style.display = 'none';

  //#endregion
});

setTimeout(() => {
  if (sessionStorage.getItem('autoJoin') === 'true') {
    usernameForm.elements[1].click();
    sessionStorage.setItem('autoJoin', false);
  }
}, 1);

socket.on('roomUsers', ({ room, roomId, users }) => {
  console.log(room);
  outputRoomName(room);
  outputUsers(users);
});

socket.on('message', (message) => {
  checkScrollnX(() => outputMessage(message));
});

socket.on('coinFlipResult', (message) => {
  checkScrollnX(() => outputCoinFlip(message));
});

socket.on('diceResult', (message) => {
  checkScrollnX(() => outputDice(message));
});

const checkScrollnX = (f) => {
  let bottom = false;
  if (
    chatMessages.scrollHeight - chatMessages.scrollTop ===
    chatMessages.clientHeight
  )
    bottom = true;
  f(); // execute the passed function
  if (bottom)
    // scroll down
    chatMessages.scrollTop = chatMessages.scrollHeight;
};

chatform.addEventListener('submit', (e) => {
  e.preventDefault();

  // get text from form
  const msg = e.target.elements.msg.value;

  // emit message to server
  socket.emit('chatMessage', msg);

  e.target.elements.msg.value = '';
  e.target.elements.msg.focus();
});

// output message to dom
const outputMessage = (message) => {
  const div = document.createElement('div');
  div.classList.add('message');
  div.innerHTML = `<p class="meta"> ${message.username}<span> ${message.time}</span></p>
  <p class="text">
    ${message.text}
  </p>`;
  document.querySelector('.chat-messages').appendChild(div);
};

function outputUsers(users) {
  userList.innerHTML = `
  ${users.map((user) => `<li>${user.username}</li>`).join('')}
  `;
}

function outputRoomName(room) {
  roomName.innerText = room;
}

const drawRandom = document.getElementById('draw-random');
drawRandom.addEventListener('click', () => {
  socket.emit('random');
});

const outputCoinFlip = (message) => {
  const div = document.createElement('div');
  div.classList.add('message');
  div.innerHTML = `<p class="meta"> ${message.username}<span> ${message.time}</span></p>
  <div class="coin">
  <div class="side-a"></div>
  <div class="side-b"></div>
</div>`;
  document.querySelector('.chat-messages').appendChild(div);

  let x = document.querySelectorAll('.coin');
  x = x[x.length - 1];
  let flipResult = message.text;
  console.log(flipResult);
  setTimeout(function () {
    if (flipResult <= 0.5) {
      x.classList.add('heads');
    } else {
      x.classList.add('tails');
    }
  }, 100);
};

const flip = document.getElementById('flip-coin');
flip.addEventListener('click', () => {
  socket.emit('flipCoin');
});

const dice = document.getElementById('roll-dice');

dice.addEventListener('click', () => {
  socket.emit('rollDice');
});

const outputDice = (message) => {
  const div = document.createElement('div');
  div.classList.add('message');
  div.innerHTML = `<p class="meta"> ${message.username}<span> ${message.time}</span></p>
  <div class="dice">Dice rolled with ${message.text}</div>`;
  document.querySelector('.chat-messages').appendChild(div);
};
