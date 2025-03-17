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
                @update-note="$emit('update-note', index)"
                @move-note="$emit('move-note', index)"
        </note-card>
    </div>
    `
});

let vue = new Vue({
    el: '#app',
    template: `</app>`,
    components: {
        App
    }
})