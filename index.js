const tasksContainer = document.getElementById('tasks');
const unlockButton = document.getElementById('unlockButton');

// ローカルストレージからタスクを取得
function loadTasks() {
    return JSON.parse(localStorage.getItem('tasks')) || [];
}

// タスクをリストにレンダリング
function renderTasks() {
    const tasks = loadTasks();
    tasksContainer.innerHTML = '';  // 既存のタスクをクリア

    tasks.forEach((task, index) => {
        const taskElement = document.createElement('div');
        taskElement.classList.add('task');
        taskElement.innerHTML = `
            <input type="checkbox" class="task-checkbox" data-index="${index}" ${task.checked ? 'checked' : ''}>
            ${task.name}
        `;
        tasksContainer.appendChild(taskElement);
    });

    checkTasks();  // タスク状態を確認してボタンを表示
}

// チェック状態を確認して「YouTube解禁」ボタンを表示
function checkTasks() {
    const tasks = loadTasks();
    const allChecked = tasks.every(task => task.checked); // すべてのタスクがチェックされているか確認
    unlockButton.style.display = allChecked ? 'block' : 'none'; // すべてのタスクがチェックされていればボタンを表示
}

// タスクをローカルストレージに保存
function saveTasks(tasks) {
    localStorage.setItem('tasks', JSON.stringify(tasks)); // ローカルストレージに保存
}

// チェックボックスが変更されたときの処理
tasksContainer.addEventListener('change', (event) => {
    if (event.target.classList.contains('task-checkbox')) {
        const taskIndex = event.target.dataset.index;
        const tasks = loadTasks();
        tasks[taskIndex].checked = event.target.checked;
        saveTasks(tasks);  // タスクの状態を保存
        checkTasks(); // ボタンの表示状態を更新
    }
});

// YouTube解禁ボタンがクリックされたときの処理
function unlockYouTube() {
    alert("Unlocked YouTube!");
}

let startTime, updatedTime, difference, running = false;
let stopwatchInterval;
let totalStudyTime = parseFloat(localStorage.getItem('totalStudyTime')) || 0;  // 合計勉強時間（時間単位）
let lastTimeChecked = parseInt(localStorage.getItem('lastTimeChecked')) || new Date().getTime(); // 最後にストップウォッチを起動した時間
let differenceAtLastStop = parseFloat(localStorage.getItem('differenceAtLastStop')) || 0;  // 最後に停止した時の経過時間
let runningState = localStorage.getItem('runningState') === 'true'; // ストップウォッチが動作中かどうか
let buttonText = document.getElementById("buttonText");
let totalStudyTimeDisplay = document.getElementById("totalStudyTime");

document.getElementById("stopwatchButton").addEventListener("click", function() {
    if (!running) {
        // ストップウォッチ開始
        running = true;
        startTime = new Date().getTime() - (differenceAtLastStop || 0);  // 最後に停止した時点から再開
        stopwatchInterval = setInterval(updateTime, 1); // 毎秒経過時間を更新
        buttonText.innerHTML = "00:00"; // 最初の表示は00:00
    } else {
        // ストップウォッチ停止
        running = false;
        clearInterval(stopwatchInterval);
        buttonText.innerHTML = "勉強を再開"; // ストップウォッチ停止後はスタートに戻す
        totalStudyTime += difference / (1000 * 60 * 60);  // 合計勉強時間を時間単位で加算
        updateTotalStudyTime();  // 合計勉強時間の表示を更新
        differenceAtLastStop = difference;  // 停止した時の経過時間を記録
        saveData();  // ローカルストレージに保存
    }
});

// 午前0時を監視し、ストップウォッチをリセット
setInterval(() => {
    let currentTime = new Date();
    let currentDate = currentTime.getDate(); // 現在の日付を取得
    let lastCheckedDate = new Date(lastTimeChecked).getDate(); // 最後にチェックした日付を取得

    // 午前0時を超えた場合
    if (currentDate !== lastCheckedDate) {
        // ストップウォッチをリセット
        startTime = currentTime.getTime();
        difference = 0;
        buttonText.innerHTML = "勉強を再開";
        lastTimeChecked = currentTime.getTime(); // 最後にチェックした日付を更新
        differenceAtLastStop = 0;  // 経過時間をリセット
        saveData();  // ローカルストレージに保存
    }
}, 60000); // 1分ごとに確認（効率的に監視）

function updateTime() {
    updatedTime = new Date().getTime();
    difference = updatedTime - startTime;

    // 秒と分に変換
    let hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    let minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    let seconds = Math.floor((difference % (1000 * 60)) / 1000);

    // 時間を2桁表示にする
    hours = (hours < 10) ? "0" + hours : hours;
    minutes = (minutes < 10) ? "0" + minutes : minutes;
    seconds = (seconds < 10) ? "0" + seconds : seconds;

    // ボタン内にタイマー表示
    buttonText.innerHTML = hours + ":" + minutes + ":" + seconds;
}



function saveData() {
    // ローカルストレージにデータを保存
    localStorage.setItem('totalStudyTime', totalStudyTime);
    localStorage.setItem('lastTimeChecked', lastTimeChecked);
    localStorage.setItem('differenceAtLastStop', differenceAtLastStop);
    localStorage.setItem('runningState', running); // ストップウォッチの状態も保存
}

// ページが読み込まれた際に保存されたデータをロード
window.addEventListener('load', function() {
    updateTotalStudyTime();

    // ページ再読み込み後は必ずボタンに「ストップウォッチスタート」を表示
    buttonText.innerHTML = "勉強を開始";

    // もしストップウォッチが動作中だった場合、再読み込み後もストップウォッチが開始されないように
    running = false;
    clearInterval(stopwatchInterval);
});

function updateStudyProgress() {
    const progress = document.getElementById("studyProgress");
    const maxHours = 8; // 例：1日の目標勉強時間
    progress.max = maxHours;
    progress.value = Math.min(totalStudyTime, maxHours);
}
function updateTotalStudyTime() {
    totalStudyTimeDisplay.innerHTML = "　　合計勉強時間: " + totalStudyTime.toFixed(2) + " 時間";
    updateStudyProgress(); // ← ここでprogressバーを更新
}
// ページ読み込み時にタスクをレンダリング
window.onload = renderTasks;