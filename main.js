const names = ["Сегодня", "Завтра", "Послезавтра"]
let baseTable = null

// VK Bridge Init
if(typeof window['AndroidBridge'] != "undefined"){
    window['AndroidBridge']['VKWebAppInit']("{}")
}else if(typeof window['webkit'] != "undefined"&&
    typeof window['webkit']['messageHandlers'] != "undefined"){
    window['webkit']['messageHandlers']['VKWebAppInit'].postMessage({})
}else{
    parent.postMessage({
        handler: "VKWebAppInit",
        params: {},
        type: 'vk-connect'
    }, '*')
}

window.onload = () => {
    const tabs = document.getElementById("days")
    fetch("./timetable.json")
        .then(r => r.json())
        .then(r => {
            baseTable = r

            let activeTab = 1
            const onUpdate = () => {
                let date = new Date()
                date.setHours(0, 0, 0, 0)
                date.setDate(date.getDate() + activeTab-new Date().getDay())

                loadTable(date, activeTab)
            }

            const openTab = (tab) => {
                tabs.children[activeTab-1].removeAttribute("active")
                activeTab = tab

                tabs.children[activeTab-1].setAttribute("active", "true")
                onUpdate()
            }

            for (let i in names) {
                const tab = document.createElement("div")
                tab.className = "tab"
                tab.classList.add("selectable")
                tab.innerText = names[i]
                tab.onclick = () => {
                    openTab(new Date().getDay()+parseInt(i))
                }

                tabs.append(tab)
            }


            openTab(new Date().getDay())
        })
        .catch(alert)
}

function loadTable(date, day) {
    const tableContainer = document.getElementById("table")
    const table = baseTable.table[day]

    let timetable = baseTable.timeline[baseTable.timeline.length-1]
    for(let i in baseTable.timeline) {
        const iTimeline = baseTable.timeline[i]
        if(typeof iTimeline.for !== "undefined"){
            if(iTimeline.for===day){
                timetable = iTimeline
                break
            }
        }
    }

    tableContainer.innerHTML = ""

    const timetableContainer = document.createElement("div")
    timetableContainer.classList.add("mdc-card", "card-body")

    for(let i in timetable.table){
        const tableContainer = document.createElement("div")
        const table = timetable.table[i]

        tableContainer.innerText = (parseInt(i)+1) + " пара: " + table.start + " - " + table.end
        timetableContainer.append(tableContainer)
    }

    tableContainer.append(timetableContainer)

    const formedTable = []
    const formedDate = ("0"+date.getDate()).slice(-2)
        + "." + ("0"+date.getMonth()).slice(-2)
        + "." + date.getFullYear()

    for (let i in table) {
        const lesson = table[i]

        if(typeof formedTable[lesson.index] == "undefined") {
            if(typeof lesson['days'] != "undefined") {
                lesson['days'].forEach(it => {
                    if (it === formedDate)
                        formedTable[lesson.index-1] = lesson
                })
            }else if(
                typeof lesson['start'] != "undefined"
            ) {
                let startDate = toISODate(lesson['start'])
                if(startDate.getTime()<=date.getTime()) {
                    if(typeof lesson['end'] != "undefined"){
                        let endDate = typeof lesson['end']== "boolean"?
                            date : toISODate(lesson['end'])

                        if(endDate.getTime()>=date.getTime()){
                            formedTable[lesson.index-1] = lesson
                        }
                    }else formedTable[lesson.index-1] = lesson
                }
            }
        }
    }

    const mainTableContainer = document.createElement("div")
    mainTableContainer.style.marginTop = "20px"
    mainTableContainer.classList.add("mdc-card", "card-body")

    for (let i = 0; i < formedTable.length; i++) {
        const lessonContainer = document.createElement("div")
        lessonContainer.className = "lesson"
        if(typeof formedTable[i] != "undefined") {
            lessonContainer.innerText = formedTable[i].name
        }else lessonContainer.innerText = "Пары нет"

        mainTableContainer.append(lessonContainer)
    }

    if(formedTable.length===0){
        mainTableContainer.innerText = "Пар нет"
    }

    tableContainer.append(mainTableContainer)
}

function toISODate(date){
    const parts = date.split(".")
    return new Date(
        parseInt(parts[2]),
        parseInt(parts[1]) - 1,
        parseInt(parts[0])
    )
}