export function convertDurationToTimeString(duration: number) {
  const hours = Math.floor(duration / (60 * 60))
  const minutes = Math.floor((duration % 3600) / 60) // minutos restantes
  const seconds = duration % 60

  const timeString = [hours, minutes, seconds]
    .map(unit => String(unit).padStart(2, '0')) // padStart faz a adição do zero pra ter 2 digitos ex: de 1 fica para 01.
    .join(':')
  
  return timeString;
}