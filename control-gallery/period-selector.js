function parseDate(dateString)
{
    var dateParts = dateString.split('-');
    return new Date(dateParts[0],dateParts[1],dateParts[2]);
}

function getDateFromAttribute(element){
    if(element) {
        return parseDate(element.getAttribute('date'));
    }

    return null;
}

//Period 
function Period(startDate, endDate){
    this.startDate = startDate;
    this.endDate = endDate;
}

Period.prototype.isDefined = function(){
    return this.startDate !== null && this.endDate !== null;
}

Period.prototype.getStart = function(){
    return this.startDate;
}
Period.prototype.getEnd = function(){
    return this.endDate;
}

// PeriodSelection
function PeriodSelection(calendar)
{
    this.calendar = calendar;
    this.periodDays = null;
    this.startDayElement = null;
    this.endDayElement = null;
}

PeriodSelection.prototype.getStartDate = function(){
    return getDateFromAttribute(this.startDayElement);
}

PeriodSelection.prototype.getEndDate = function(){
    return getDateFromAttribute(this.endDayElement);
}

PeriodSelection.prototype.clear = function(){
    if(this.startDayElement) this.startDayElement.classList.remove('calendar__start-day');
    if(this.endDayElement) this.endDayElement.classList.remove('calendar__end-day');
    if(this.periodDays) Array.prototype.forEach.call(this.periodDays, elem => {
        elem.classList.remove('calendar__day--in-period');
       }); 
    this.startDayElement = null;
    this.endDayElement = null;
    this.periodDays = null;
}

PeriodSelection.prototype.trySelectDateElement = function(dateElement)
{
    if(dateElement.classList.contains('calendar__day--unavailable'))
    {
        return false;
    }

    if(this.startDayElement && this.endDayElement)
    {
        this.clear();
    }

    if(this.startDayElement){
        const endDate = getDateFromAttribute(dateElement);
        const startDate = this.getStartDate();
        if(startDate > endDate)
        {
            return false;
        }

        const days = this.calendar
                            .findPeriodDays(
                                this.getStartDate(), 
                                endDate);

        if(Array.prototype.some.call(days, dayElement => {
                return dayElement.classList.contains('calendar__day--unavailable');
        })){
           return false;
        }   
        else{
            this.periodDays = days;
            this.periodDays.forEach(element => element.classList.toggle('calendar__day--in-period'));
            this.endDayElement = dateElement;
            this.endDayElement.classList.toggle('calendar__end-day');
           return true;
        }
    }else{
        this.startDayElement = dateElement;
        this.startDayElement.classList.toggle('calendar__start-day');
        return true;
    }
}


// PeriodSelectorCalendar
function PeriodSelectorCalendar(periodSelectorRoot, changeCallback)
{
    this.calendarDays = periodSelectorRoot.querySelectorAll('.period-selector.calendar .calendar__day');
    this.selection = new PeriodSelection(this);
    periodSelectorRoot.querySelector('.period-selector.calendar .calendar__component')
                        .addEventListener('click', (event)=>{
                            const target = event.target;
                                if(target.attributes.date && this.selection.trySelectDateElement(target))
                                {
                                    changeCallback();
                                };
                        });

}

PeriodSelectorCalendar.prototype.findPeriodDays = function(startDate, endDate){
    const periodDays = Array.prototype.filter.call(this.calendarDays, dayElement => {
        
        var elementDate = getDateFromAttribute(dayElement);
        return startDate < elementDate && elementDate < endDate;
    });
 
    return periodDays;
}

// PeriodSelectorComponent
function PeriodSelectorComponent(root, changeCallback)
{
    this.root = root;
    this.calendar = new PeriodSelectorCalendar(root, ()=>{
        const selection = this.calendar.selection;
        const period = new Period(selection.getStartDate(), selection.getEndDate());
        changeCallback(period);
    });
}


function onPeriodSelectorLoad(){

    const calendarComponents =document.getElementsByClassName('period-selector');
 
    for(i=0;i< calendarComponents.length;i++){
        var selectorComponent = new PeriodSelectorComponent(calendarComponents[i], (period)=> console.log('Period Change event ' + period.isDefined() +':'+period.getStart() +':'+period.getEnd()));
    }
}

window.addEventListener('load', onPeriodSelectorLoad);
