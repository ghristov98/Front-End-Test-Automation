window.addEventListener("load", solve);

function solve() {
    const transportModeElement = document.getElementById('transport-mode')
    const departureTimeSlotElement = document.getElementById('departure-time')
    const nameElement = document.getElementById('passenger-name')
    const emailElement = document.getElementById('passenger-email')
    const phoneNumElement = document.getElementById('passenger-phone')

    const previewTranMode = document.getElementById('preview-transport-mode')
    const previewDepTimeElement = document.getElementById('preview-departure-time')
    const previewNameElement = document.getElementById('preview-passenger-name')
    const previewEmailElement = document.getElementById('preview-passenger-email')
    const previewPhoneElement = document.getElementById('preview-passenger-phone')

    const previewElement = document.getElementById('preview')
    const confirmationElement = document.getElementById('confirmation')

    const bookBtnElement = document.getElementById('book-btn')
    bookBtnElement.addEventListener('click', onAdd)

    function onAdd(e) {
        e.preventDefault()

        const allFieldsAreFilled = departureTimeSlotElement.value === '' ||
            transportModeElement.value === '' ||
            nameElement.value === '' ||
            emailElement.value === '' ||
            phoneNumElement.value === ''

        if (allFieldsAreFilled) {
            return
        }

        previewTranMode.textContent = transportModeElement.value
        previewDepTimeElement.textContent = departureTimeSlotElement.value
        previewNameElement.textContent = nameElement.value
        previewEmailElement.textContent = emailElement.value
        previewPhoneElement.textContent = phoneNumElement.value

        previewElement.style.display = 'block'
        bookBtnElement.disabled = true

        transportModeElement.value = ''
        departureTimeSlotElement.value = ''
        nameElement.value = ''
        emailElement.value = ''
        phoneNumElement.value = ''

    }

    const editBtnElement = document.getElementById('edit-btn')
    editBtnElement.addEventListener('click', onEdit)

    function onEdit(d) {

        transportModeElement.value = previewTranMode.textContent
        departureTimeSlotElement.value = previewDepTimeElement.textContent
        nameElement.value = previewNameElement.textContent
        emailElement.value = previewEmailElement.textContent
        phoneNumElement.value = previewPhoneElement.textContent

        previewElement.style.display = 'none'
        bookBtnElement.disabled = false
    }

    const confirmBtnElement = document.getElementById('confirm-btn')
    confirmBtnElement.addEventListener('click', onConfirm)

    function onConfirm(a){

        confirmationElement.style.display = 'block'
        previewElement.style.display = 'none'
        bookBtnElement.disabled = true
      
    }

    const backBtnElement = document.getElementById('back-btn')
    backBtnElement.addEventListener('click', onBook)

    function onBook(){

        confirmationElement.style.display = 'none'
        bookBtnElement.disabled = false
    }
}