<template>
  <div class="container">
    <h1>Calendar</h1>
    <FullCalendar :options="calendarOptions">
      <template v-slot:eventContent='arg'>
        <div class="event" :style="{ backgroundColor: arg.event.backgroundColor }">
          <h5 class="event-title">
            <span class="event-date-time" v-if="!arg.event.allDay">
              {{ arg.timeText }}
            </span>
            {{ arg.event.title }}
          </h5>
        </div>
      </template>
    </FullCalendar>
    <event-modal v-model="showEventModal" :event="selectedEvent" @close="closeEventModal" @save="saveEvent"
      @delete="deleteEvent" />
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive } from 'vue';
import FullCalendar from '@fullcalendar/vue3';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import type { CalendarOptions, EventClickArg, DateSelectArg, EventDropArg } from '@fullcalendar/core';
import EventModal from '@/components/EventModal.vue';
import { useToast } from 'vue-toast-notification';

interface CalendarEvent {
  id: string;
  title: string;
  start: Date | string;
  end?: Date | string;
  color: string;
  allDay: boolean;
  notes?: string;
}

const DEFAULT_COLOR = '#3788d8';

const $toast = useToast();


const showEventModal = ref(false);
const selectedEvent = ref<CalendarEvent | null>(null);

const calendarOptions: CalendarOptions = reactive({
  plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
  initialView: 'dayGridMonth',
  headerToolbar: {
    left: 'prev,next today',
    center: 'title',
    right: 'dayGridMonth,timeGridWeek,timeGridDay'
  },
  editable: true,
  selectable: true,
  events: [],
  eventClick: handleEventClick,
  select: handleDateSelect,
  eventDrop: (info: EventDropArg) => {
    const event: CalendarEvent = calendarOptions.events.find((e: CalendarEvent) => e.id === info.event.id);
    if (event) {
      event.start = info.event.start;
      event.end = info.event.end;
    }
  }
});

function handleEventClick(info: EventClickArg) {
  selectedEvent.value = {
    id: info.event.id,
    title: info.event.title,
    start: info.event.startStr,
    end: info.event.end,
    color: info.event.backgroundColor,
    allDay: info.event.allDay,
    notes: info.event.extendedProps.notes
  };
  showEventModal.value = true;
}

function handleDateSelect(info: DateSelectArg) {
  selectedEvent.value = {
    id: '',
    title: '',
    start: info.startStr,
    end: info.endStr,
    allDay: info.allDay,
    color: DEFAULT_COLOR
  };
  showEventModal.value = true;
}

const saveEvent = (eventData: CalendarEvent) => {
  const existingEventIndex: number = calendarOptions.events.findIndex((e: CalendarEvent) => e.id === eventData.id);
  if (existingEventIndex > -1) {
    calendarOptions.events[existingEventIndex] = eventData
  } else {
    calendarOptions.events.push({
      ...eventData,
      id: Date.now().toString()
    });
  }
  showEventModal.value = false;
  $toast.success('Event added successfully!');
};

const deleteEvent = (eventId: string) => {
  calendarOptions.events = calendarOptions.events.filter((e: CalendarEvent) => e.id !== eventId);
  showEventModal.value = false;
  $toast.success('Event removed successfully!');
};

const closeEventModal = () => {
  showEventModal.value = false;
  selectedEvent.value = null;
}
</script>

<style scoped>
.container {
  width: 80%;
  margin: 0 auto;
  position: relative;
}

.fc {
  width: 100%;
  height: 100%;
}

.event {
  width: 100%;
  border-radius: 4px;
}

.event-title {
  margin: 0;
  font-size: 12px;
  font-weight: bold;
  color: white;
}

.event-date-time {
  margin-right: 3px;
}
</style>
