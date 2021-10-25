const names = ["Сегодня", "Завтра", "Послезавтра"]
let baseTable = null

window.onload = () => {
    // VK Bridge Init
    if(typeof window['androidBridge'] != "undefined"){
        window['androidBridge']['VKWebAppInit']()
    }else if(typeof window['iosBridge'] != "undefined"){
        window['iosBridge']['VKWebAppInit'].postMessage({})
    }

    const days = document.getElementById("days")
    fetch("./timetable.json")
        .then(r => r.json())
        .then(r => {
            baseTable = r

            const nowDay = new Date().getDay()
            for (let i = 0; i < 3; i++) {
                const day = document.createElement("div")
                day.className = "tab"
                day.classList.add("selectable")
                day.innerText = names[i]
                day.onclick = () => loadTable(new Date(new Date().getTime() +
                    24 * 60 * 60 * 1000), nowDay+i)

                days.append(day)
            }

            loadTable(new Date(), nowDay)
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
            if(iTimeline.for===day.toString()){
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
                typeof lesson['start'] != "undefined" &&
                typeof lesson['end'] != "undefined"
            ) {
                let startDate = toISODate(lesson['start'])
                let endDate = typeof lesson['end']== "boolean"?
                    lesson['end'] : toISODate(lesson['end'])

                if(startDate.getTime()<=date.getTime()&&
                    endDate.getTime()>=date.getTime()) {
                    formedTable[lesson.index-1] = lesson
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