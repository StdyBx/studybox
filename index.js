const tasksContainer = document.getElementById('tasks');
const unlockButton = document.getElementById('unlockButton');

// ローカルストレージからタスクを取得
function loadTasks() {
    return JSON.parse(localStorage.getItem('tasks')) || [];
}


function renderTasks() {
    const tasks = loadTasks();  // ローカルストレージからタスクデータを取得
    tasksContainer.innerHTML = '';  // 既存のタスクをクリア

    const weekdays = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
    const today2 = new Date().getDay(); // 0 (日曜)〜6 (土曜)
    const todayStr = weekdays[today2];

    tasks.forEach((task, index) => {
        if (task.day === 'all' || task.day === todayStr) {
            const taskElement = document.createElement('div');
            taskElement.classList.add('task');
            taskElement.innerHTML = `
                <input type="checkbox" class="task-checkbox" data-index="${index}" ${task.checked ? 'checked' : ''}>
                ${task.name}
            `;
            tasksContainer.appendChild(taskElement);
        }
    });

    checkTasks();  // タスク状態を確認してボタンを表示
}


function checkTasks() {
    const tasks = loadTasks();
    
    // 今日の曜日（mon, tue, wed, ...）
    const weekdays = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
    const todayStr = weekdays[new Date().getDay()];  // 今日の曜日を取得 (sun〜sat)

    // 今日表示されるタスクだけをフィルタリング ('all' と今日の曜日)
    const visibleTasks = tasks.filter(task => task.day === 'all' || task.day === todayStr);

    // 表示されているタスクの中でチェックされているものをカウント
    const checkedTasks = visibleTasks.filter(task => task.checked).length;

    // 表示されているタスクの数とチェックされたタスクの数が一致すればアンロックボタンを表示
    const allChecked = checkedTasks === visibleTasks.length;

    unlockButton.style.display = allChecked ? 'block' : 'none';

    // checkTasks 内
    if (allChecked) {
        const todayDateStr = new Date().toLocaleDateString(); // 形式を一致させる
        localStorage.setItem('tasksCompletedDate', todayDateStr);
    }
}




function saveTasks(tasks) {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

tasksContainer.addEventListener('change', (event) => {
    if (event.target.classList.contains('task-checkbox')) {
        const taskIndex = event.target.dataset.index;
        const tasks = loadTasks();
        tasks[taskIndex].checked = event.target.checked;  // チェックボックスの状態を更新
        saveTasks(tasks);  // 更新されたタスクデータを保存
        checkTasks(); // ボタンの表示状態を更新
    }
});


function unlockYouTube() {
    window.location.href = 'shortcuts://run-shortcut?name=OpenYouTube';
}

// ===== ストップウォッチ関連 =====
let startTime, updatedTime, difference, running = false;
let stopwatchInterval;

// === 合計系 ===
let todayStudyTime = parseFloat(localStorage.getItem('todayStudyTime')) || 0;
let lastRecordedDate = localStorage.getItem('lastRecordedDate') || new Date().toLocaleDateString();
let totalStudyTime = parseFloat(localStorage.getItem('totalStudyTime')) || 0;

// === セッション状態 ===
let lastTimeChecked = parseInt(localStorage.getItem('lastTimeChecked')) || new Date().getTime();
let differenceAtLastStop = parseFloat(localStorage.getItem('differenceAtLastStop')) || 0;
let runningState = localStorage.getItem('runningState') === 'true';

let buttonText = document.getElementById("buttonText");
let totalStudyTimeDisplay = document.getElementById("totalStudyTime");

// ✅ ストップウォッチのクリックイベント
document.getElementById("stopwatchButton").addEventListener("click", function () {
    if (!running) {
        running = true;
        startTime = new Date().getTime() - (differenceAtLastStop || 0);
        stopwatchInterval = setInterval(updateTime, 1);
        buttonText.innerHTML = "00:00";
    } else {
        running = false;
        clearInterval(stopwatchInterval);
        buttonText.innerHTML = "勉強を再開";
        todayStudyTime += difference / (1000 * 60 * 60);  // ✅ ここだけで一時記録
        differenceAtLastStop = difference;
        saveStudyTimeMeta();  // ✅ 合計はまだ加算しない
    }
});

// ✅ 翌日になったら、前日分の勉強時間を正式合算
function reflectYesterdayStudyTime() {
    const today = new Date().toLocaleDateString();
    if (lastRecordedDate !== today) {
        totalStudyTime += todayStudyTime;
        todayStudyTime = 0;
        lastRecordedDate = today;
        localStorage.setItem('totalStudyTime', totalStudyTime.toFixed(2));
        saveStudyTimeMeta();
    }
}
function saveStudyTimeMeta() {
    localStorage.setItem('todayStudyTime', todayStudyTime);
    localStorage.setItem('lastRecordedDate', lastRecordedDate);
    localStorage.setItem('differenceAtLastStop', differenceAtLastStop);
    localStorage.setItem('lastTimeChecked', lastTimeChecked);
    localStorage.setItem('runningState', running);
}

function updateTime() {
    updatedTime = new Date().getTime();
    difference = updatedTime - startTime;

    let hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    let minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    let seconds = Math.floor((difference % (1000 * 60)) / 1000);

    hours = (hours < 10) ? "0" + hours : hours;
    minutes = (minutes < 10) ? "0" + minutes : minutes;
    seconds = (seconds < 10) ? "0" + seconds : seconds;

    buttonText.innerHTML = hours + ":" + minutes + ":" + seconds;
}

// ✅ 0時をまたいだときのリセット処理
setInterval(() => {
    let currentTime = new Date();
    let currentDate = currentTime.getDate();
    let lastCheckedDate = new Date(lastTimeChecked).getDate();

    if (currentDate !== lastCheckedDate) {
        startTime = currentTime.getTime();
        difference = 0;
        buttonText.innerHTML = "勉強を再開";
        lastTimeChecked = currentTime.getTime();
        differenceAtLastStop = 0;
        saveStudyTimeMeta();
    }
}, 60000);

// ✅ 合計勉強時間表示
function updateTotalStudyTime() {
    totalStudyTimeDisplay.innerHTML = "　　合計勉強時間: " + totalStudyTime.toFixed(2) + " 時間";
    updateStudyProgress();
}
function updateStudyProgress() {
    const progress = document.getElementById("studyProgress");
    const maxHours = 1200;
    progress.max = maxHours;
    progress.value = Math.min(totalStudyTime, maxHours);
}

function resetTasksIfNeeded() {
    const lastTaskDate = localStorage.getItem('tasksCompletedDate');
    const today = new Date().toLocaleDateString();

    if (lastTaskDate !== today) {
        const tasks = loadTasks().map(task => ({ ...task, checked: false }));
        saveTasks(tasks);
        localStorage.removeItem('tasksCompletedDate');
    }
}

// ✅ ページ読み込み時の初期化
window.onload = () => {
    reflectYesterdayStudyTime();  // ← 合計に昨日の分を反映
    updateTotalStudyTime();
    resetTasksIfNeeded();
    renderTasks();
    buttonText.innerHTML = "勉強を開始";
    running = false;
    clearInterval(stopwatchInterval);
};