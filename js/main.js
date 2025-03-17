Vue.component('column', {
    // данные
    props: ['title', 'notes', 'maxNotes', 'isLocked', 'allowAdd'],
    // шаблон
    template: `
    <div class="column" :class="{ 'locked': isLocked }">
        <h2>{{ title }}</h2>
        <note-card v-for="note in notes"
                :note="note"
                :key="note.id"
        </note-card>
    </div>
    `
});