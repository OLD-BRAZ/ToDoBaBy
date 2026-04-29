const state = {
  tasks: JSON.parse(localStorage.getItem("todo_tasks") || "[]"),
  theme: localStorage.getItem("todo_theme") || "theme-light",
  currentTab: "todo",
  currentMonth: new Date().getMonth(),
  currentYear: new Date().getFullYear(),
  search: "",
};

const el = {
  themeSelect: document.getElementById("themeSelect"),
  clearCompletedBtn: document.getElementById("clearCompletedBtn"),
  prevMonthBtn: document.getElementById("prevMonthBtn"),
  nextMonthBtn: document.getElementById("nextMonthBtn"),
  calendarTitle: document.getElementById("calendarTitle"),
  calendarGrid: document.getElementById("calendarGrid"),
  todoForm: document.getElementById("todoForm"),
  todoInput: document.getElementById("todoInput"),
  todoDate: document.getElementById("todoDate"),
  todoPriority: document.getElementById("todoPriority"),
  todoList: document.getElementById("todoList"),
  doneList: document.getElementById("doneList"),
  statsPanel: document.getElementById("statsPanel"),
  tabs: Array.from(document.querySelectorAll(".tab")),
  searchInput: document.getElementById("searchInput"),
};

function save() {
  localStorage.setItem("todo_tasks", JSON.stringify(state.tasks));
  localStorage.setItem("todo_theme", state.theme);
}

function formatDate(value) {
  if (!value) return "未设置日期";
  const d = new Date(value + "T00:00:00");
  return d.toLocaleDateString("zh-CN");
}

function renderCalendar() {
  const firstDay = new Date(state.currentYear, state.currentMonth, 1);
  const lastDate = new Date(state.currentYear, state.currentMonth + 1, 0).getDate();
  const offset = (firstDay.getDay() + 6) % 7;

  el.calendarTitle.textContent = `${state.currentYear}年 ${state.currentMonth + 1}月`;
  el.calendarGrid.innerHTML = "";

  ["一", "二", "三", "四", "五", "六", "日"].forEach((name) => {
    const cell = document.createElement("div");
    cell.className = "day-name";
    cell.textContent = name;
    el.calendarGrid.appendChild(cell);
  });

  for (let i = 0; i < offset; i += 1) {
    const blank = document.createElement("div");
    el.calendarGrid.appendChild(blank);
  }

  const today = new Date();
  for (let day = 1; day <= lastDate; day += 1) {
    const cell = document.createElement("div");
    cell.className = "day";
    const dateString = `${state.currentYear}-${String(state.currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const hasTask = state.tasks.some((t) => !t.done && t.date === dateString);
    if (hasTask) cell.classList.add("has-task");
    if (
      day === today.getDate() &&
      state.currentMonth === today.getMonth() &&
      state.currentYear === today.getFullYear()
    ) {
      cell.classList.add("today");
    }
    cell.textContent = String(day);
    el.calendarGrid.appendChild(cell);
  }
}

function taskItem(task) {
  const li = document.createElement("li");
  li.className = "task-item";
  li.innerHTML = `
    <div class="task-main">
      <strong>${task.text}</strong>
      <small>截止：${formatDate(task.date)}</small>
    </div>
    <div>
      <span class="tag ${task.priority}">${task.priority}</span>
      <button data-action="toggle" data-id="${task.id}">${task.done ? "恢复" : "完成"}</button>
      <button data-action="delete" data-id="${task.id}" class="ghost">删除</button>
    </div>`;
  return li;
}

function renderTasks() {
  const keyword = state.search.toLowerCase();
  const filtered = state.tasks.filter((t) => t.text.toLowerCase().includes(keyword));
  const todo = filtered.filter((t) => !t.done);
  const done = filtered.filter((t) => t.done);

  el.todoList.innerHTML = "";
  todo.sort((a, b) => (a.date || "9999").localeCompare(b.date || "9999")).forEach((task) => {
    el.todoList.appendChild(taskItem(task));
  });

  el.doneList.innerHTML = "";
  done.forEach((task) => el.doneList.appendChild(taskItem(task)));

  const total = state.tasks.length;
  const completed = state.tasks.filter((t) => t.done).length;
  const overdue = state.tasks.filter((t) => !t.done && t.date && new Date(t.date) < new Date(new Date().toDateString())).length;
  el.statsPanel.innerHTML = `
    <p>总任务数：<strong>${total}</strong></p>
    <p>已完成：<strong>${completed}</strong></p>
    <p>待完成：<strong>${total - completed}</strong></p>
    <p>逾期任务：<strong>${overdue}</strong></p>`;
}

function switchTab(tab) {
  state.currentTab = tab;
  el.tabs.forEach((b) => b.classList.toggle("active", b.dataset.tab === tab));
  el.todoList.classList.toggle("hidden", tab !== "todo");
  el.doneList.classList.toggle("hidden", tab !== "done");
  el.statsPanel.classList.toggle("hidden", tab !== "stats");
}

function applyTheme(theme) {
  document.body.classList.remove("theme-light", "theme-dark", "theme-forest");
  document.body.classList.add(theme);
  state.theme = theme;
  save();
}

el.todoForm.addEventListener("submit", (e) => {
  e.preventDefault();
  state.tasks.push({
    id: crypto.randomUUID(),
    text: el.todoInput.value.trim(),
    date: el.todoDate.value,
    priority: el.todoPriority.value,
    done: false,
  });
  el.todoForm.reset();
  save();
  renderTasks();
  renderCalendar();
});

document.body.addEventListener("click", (e) => {
  const target = e.target;
  if (!(target instanceof HTMLElement)) return;

  const action = target.dataset.action;
  const id = target.dataset.id;
  if (action && id) {
    state.tasks = state.tasks
      .map((t) => (t.id === id && action === "toggle" ? { ...t, done: !t.done } : t))
      .filter((t) => !(t.id === id && action === "delete"));
    save();
    renderTasks();
    renderCalendar();
  }
});

el.tabs.forEach((btn) => btn.addEventListener("click", () => switchTab(btn.dataset.tab)));
el.searchInput.addEventListener("input", (e) => {
  state.search = e.target.value;
  renderTasks();
});
el.clearCompletedBtn.addEventListener("click", () => {
  state.tasks = state.tasks.filter((t) => !t.done);
  save();
  renderTasks();
  renderCalendar();
});
el.prevMonthBtn.addEventListener("click", () => {
  state.currentMonth -= 1;
  if (state.currentMonth < 0) {
    state.currentMonth = 11;
    state.currentYear -= 1;
  }
  renderCalendar();
});
el.nextMonthBtn.addEventListener("click", () => {
  state.currentMonth += 1;
  if (state.currentMonth > 11) {
    state.currentMonth = 0;
    state.currentYear += 1;
  }
  renderCalendar();
});
el.themeSelect.addEventListener("change", (e) => applyTheme(e.target.value));

el.themeSelect.value = state.theme;
applyTheme(state.theme);
renderCalendar();
renderTasks();
switchTab("todo");


const desktopApi = window.desktopWidget || null;
const pinBtn = document.getElementById("pinBtn");
const minBtn = document.getElementById("minBtn");
const closeBtn = document.getElementById("closeBtn");
if (desktopApi && pinBtn && minBtn && closeBtn) {
  pinBtn.addEventListener("click", () => desktopApi.togglePin());
  minBtn.addEventListener("click", () => desktopApi.minimize());
  closeBtn.addEventListener("click", () => desktopApi.close());
  desktopApi.onPinnedChange((pinned) => {
    pinBtn.textContent = pinned ? "取消置顶" : "置顶";
  });
}
