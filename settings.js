const taskList = document.getElementById('taskList');
const newTaskInput = document.getElementById('newTaskInput');

// 既存のタスクをロード
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

// タスクをリストにレンダリング
function renderTasks() {
    taskList.innerHTML = '';  // 既存のタスクをクリア
    const weekdays = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'all'];
    const jp = ['日', '月', '火', '水', '木', '金', '土', '全'];
    tasks.forEach((task, index) => {
        const taskItem = document.createElement('li');
        const disp = weekdays.indexOf(tasks[index].day);
        const todayJp = jp[disp];
        taskItem.innerHTML = `
            ${task.name + "  *" + jp[disp] + "曜日" + "*"}
            <button onclick="removeTask(${index})">削除</button>
        `;
        taskList.appendChild(taskItem);
    });
}

// 新しいタスクを追加
function addTask() {
    const newTaskName = newTaskInput.value.trim();
    const selectedDay = day.value;
    if (newTaskName) {
        tasks.push({ name: newTaskName, checked: false, day: selectedDay });
        newTaskInput.value = ''; // 入力フィールドをクリア
        renderTasks();
    }
}

// タスクを削除
function removeTask(index) {
    tasks.splice(index, 1);
    renderTasks();
}

// タスクをローカルストレージに保存
function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
    alert('タスクを保存しました！');
}

// 戻るボタンで前の画面に遷移
function goBack() {
    window.location.href = 'index.html'; // メイン画面に遷移
}

// ページ読み込み時にタスクを表示
renderTasks();