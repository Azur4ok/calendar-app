<template>
    <div v-if="modelValue" class="modal-overlay" @click="closeModal">
        <div class="modal-content" @click.stop>
            <h2>{{ isNewEvent ? 'Add Event' : 'Edit Event' }}</h2>
            <form @submit.prevent="validateAndSave">
                <div class="form-group">
                    <label for="eventTitle">Title:</label>
                    <input id="eventTitle" v-model="eventData.title" type="text" maxlength="30" required>
                </div>
                <div class="form-group">
                    <label for="eventStart">Start:</label>
                    <input id="eventStart" v-model="eventData.start"
                        :type="eventData.allDay ? 'date' : 'datetime-local'" required>
                </div>
                <div class="form-group" v-if="!eventData.allDay">
                    <label for="eventEnd">End:</label>
                    <input id="eventEnd" v-model="eventData.end" type="datetime-local">
                </div>
                <div class="form-group">
                    <label for="eventNotes">Notes:</label>
                    <textarea id="eventNotes" v-model="eventData.notes" rows="3" />
                </div>
                <div class="form-group">
                    <label for="eventColor">Color:</label>
                    <input id="eventColor" v-model="eventData.color" type="color">
                </div>
                <div class="button-group">
                    <button type="submit">Save</button>
                    <button v-if="!isNewEvent" type="button" class="delete-btn" @click="deleteEvent">
                        Delete
                    </button>
                </div>
            </form>
            <button class="close-btn" @click="closeModal">X</button>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref, computed, watch } from 'vue';
import { formatDateTime } from '@/utils';
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

interface EventFormData {
    id: string;
    title: string;
    start: string;
    end: string;
    color: string;
    allDay: boolean;
    notes: string;
}

const props = defineProps<{
    modelValue: boolean;
    event: CalendarEvent | null;
}>();

const emit = defineEmits<{
    (e: 'update:modelValue', value: boolean): void;
    (e: 'save', event: CalendarEvent): void;
    (e: 'delete', id: string): void;
}>();

const $toast = useToast();

const eventData = ref<EventFormData>({
    id: props.event?.id || '',
    title: props.event?.title || '',
    start: formatDateTime(props.event?.start || new Date(), props.event?.allDay || false),
    end: props.event?.end ? formatDateTime(props.event?.end, props.event?.allDay || false) : '',
    color: props.event?.color || '#3788d8',
    allDay: props.event?.allDay || false,
    notes: props.event?.notes || ''
});

const isNewEvent = computed(() => !props.event || !props.event.id);


const resetForm = () => {
    const now = new Date();
    eventData.value = {
        id: '',
        title: '',
        start: formatDateTime(now, false),
        end: formatDateTime(new Date(now.getTime() + 60 * 60 * 1000), false),
        color: '#3788d8',
        allDay: false,
        notes: ''
    };
};

const closeModal = () => {
    emit('update:modelValue', false);
};

const validateAndSave = () => {
    if (!eventData.value.allDay && new Date(eventData.value.end) <= new Date(eventData.value.start)) {
        $toast.error('End time must be after start time for non-all-day events.');
        return;
    }

    saveEvent();
};

const saveEvent = () => {
    const { id, title, start, end, color, allDay, notes } = eventData.value;
    emit('save', {
        id,
        title,
        start: new Date(start),
        end: allDay ? undefined : (end ? new Date(end) : undefined),
        color,
        allDay,
        notes: notes || ""
    });
    closeModal();
};

const deleteEvent = () => {
    emit('delete', eventData.value.id);
    closeModal();
};
watch(() => props.event, (newEvent) => {
    if (newEvent) {
        eventData.value = {
            id: newEvent.id || '',
            title: newEvent.title || '',
            start: formatDateTime(newEvent.start, newEvent.allDay),
            end: newEvent.end ? formatDateTime(newEvent.end, newEvent.allDay) : '',
            color: newEvent.color,
            allDay: newEvent.allDay,
            notes: newEvent.notes || ''
        };
    } else {
        resetForm();
    }
}, { immediate: true });

</script>

<style scoped>
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 100;
}

.modal-content {
    background-color: white;
    position: relative;
    z-index: 1001;
    padding: 1.5rem 2rem;
    border-radius: 8px;
    width: 90%;
    max-width: 500px;
}

.form-group {
    margin-bottom: 1rem;
}

label {
    display: block;
    margin-bottom: 0.5rem;
}

input {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid #ccc;
    border-radius: 4px;
}

#eventNotes {
    width: 100%;
}

input[type="color"] {
    cursor: pointer;
    display: inline-block;
    height: 50px;
    border: 1px solid #ccc;
    border-radius: 4px;
}

.button-group {
    display: flex;
    justify-content: space-between;
    margin-top: 1rem;
}

button {
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 4px;
    cursor: pointer;
}

button[type="submit"] {
    background-color: #3788d8;
    color: white;
}

.close-btn {
    top: 2px;
    right: 0;
    position: absolute;
    background-color: transparent;
    transition: scale .3s ease-in-out;
}

.close-btn:hover {
    scale: 1.3;
}

.delete-btn {
    background-color: #dc3545;
    color: white;
}
</style>