let msgData = [];
const msgInput = document.getElementById('msgInput');
const sendBtn = document.getElementById('sendBtn');
const msgList = document.getElementById('msgList');
const charCount = document.getElementById('charCount');


function renderMessages() {
    msgList.innerHTML = ''; 
    msgData.forEach(msg => {
        const li = document.createElement('li');
        li.className = 'message-card';

        const divContent = document.createElement('div');
        divContent.className = 'msg-content';
        divContent.textContent = msg.content; 

        const divMeta = document.createElement('div');
        divMeta.className = 'msg-meta';
        
        
        divMeta.innerHTML = `
            <div class="meta-left">
                <span class="time">${msg.time}</span>
            </div>
            <div class="meta-right">
                <button class="btn-like" onclick="likeMessage(${msg.id})">
                    👍 <span id="like-${msg.id}">${msg.likes || 0}</span>
                </button>
                <button class="btn-delete" onclick="deleteMessage(${msg.id})">删除</button>
            </div>
        `;

        li.appendChild(divContent);
        li.appendChild(divMeta);
        msgList.appendChild(li);
    });
}


window.likeMessage = function(id) {
        fetch(`api/messages/${id}/like`, { method: 'POST' })
        .then(res => res.json())
        .then(data => {
            if(data.success) { 
                const span = document.getElementById(`like-${id}`);
                span.textContent = parseInt(span.textContent) + 1;
                const msg = msgData.find(m => m.id === id);
                if(msg) msg.likes = (msg.likes || 0) + 1;
            }
        })
        .catch(err => console.error('点赞失败', err));
};


window.deleteMessage = function(id) {
    if (!confirm("确定要删除这条树洞吗？")) return;
    fetch(`api/messages/${id}`, { method: 'DELETE' })
      .then(res => {
        if (!res.ok) throw new Error('删除失败');
        return res.json();
      })
      .then(() => {
        loadMessages();
      })
      .catch(err => {
        console.error('删除失败', err);
        alert('删除失败，请稍后重试');
      });
};

msgInput.addEventListener('input', function() {
    const len = this.value.length;
    charCount.textContent = `${len}/200`;
    charCount.style.color = len >= 200 ? 'red' : '#888';
});

function loadMessages() {
    fetch('api/messages')
        .then(res => res.json())
        .then(data => {
            msgData = data;
            renderMessages();
        }).catch(err => {
            console.error('加载留言失败', err);
        });
}

sendBtn.onclick = () => {
    const content = msgInput.value.trim();
    if (!content) {
        alert('内容不能为空！请输入后再发送。');
        return;
    }
    sendBtn.disabled = true;
    
    fetch('api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: content })
    }).then(res => res.json())
      .then(() => {
        msgInput.value = '';
        charCount.textContent = '0/200';
        loadMessages();
      }).catch(err => console.error('发送失败', err))
      .finally(() => sendBtn.disabled = false);
};

loadMessages();