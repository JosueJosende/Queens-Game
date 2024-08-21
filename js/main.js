import { easy, medium, hard } from './boards.js'

const $ = (el) => document.querySelector(el)
const $$ = (el) => document.querySelectorAll(el)

const $board = $('#board')
const $reset = $('#reset')
const $clear = $('#clear')
const $timer = $('#timer')
const $easy = $('.easy')
const $medium = $('.medium')
const $hard = $('.hard')
const $levels = $('.levels')

let queens = []
let interval
let BOARD = easy

const SECTIONS_COLORS = {
  1: '#007b60',
  2: '#d18b00',
  3: '#c75d00',
  4: '#0044cc',
  5: '#b94343',
  6: '#9d721c',
  7: '#008b8b',
  8: '#8b008b'
}

$board.addEventListener('click', (e) => {
  e.preventDefault()

  const $cell = e.target

  const { row, cell } = e.target.dataset

  if ($cell.classList.contains('marked')) {
    if (queens.length === 8) return

    $cell.classList.remove('marked')
    $cell.classList.add('queen')

    queens.push({ row, cell, valid: true })
  } else if ($cell.classList.contains('queen')) {
    $cell.classList.remove('queen')

    queens = queens.filter((queen) => {
      return !(queen.row === row && queen.cell === cell)
    })
  } else {
    $cell.classList.add('marked')
  }

  validateBoard()
})

$clear.addEventListener('click', (e) => {
  e.preventDefault()

  $$('.cell').forEach((cell) => {
    cell.classList.remove('queen', 'marked')
    queens = []
  })
})

$reset.addEventListener('click', (e) => {
  e.preventDefault()
  $levels.showModal()
  // resetGame()
})

/* $easy.addEventListener('click', (e) => {
  e.preventDefault()
  BOARD = easy
  $levels.close()
  resetGame()
})

$medium.addEventListener('click', (e) => {
  e.preventDefault()
  BOARD = medium
  $levels.close()
  resetGame()
})

$hard.addEventListener('click', (e) => {
  e.preventDefault()
  BOARD = hard
  $levels.close()
  resetGame()
}) */

$levels.addEventListener('click', (e) => {
  e.preventDefault()

  const mode = e.target.classList[0]
  BOARD = mode === 'easy' ? easy : mode === 'medium' ? medium : hard

  $levels.close()
  resetGame()
})

function createGame() {
  const boardState = createBoard()

  $board.innerHTML = boardState
  queens = []

  initTimer(false)
}

function initTimer(stop) {
  let time = 0

  if (stop) {
    clearInterval(interval)
    return
  }

  $timer.textContent = '00:00'

  interval = setInterval(() => {
    time++

    const minutes = Math.floor(time / 60)
    const seconds = time % 60

    $timer.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }, 1000)
}

function createBoard() {
  return BOARD.map((row, idRow) => {
    return row
      .map((section, idCell) => {
        return createCell(SECTIONS_COLORS[section], idRow, idCell)
      })
      .join('')
  }).join('')
}

function createCell(color, idRow, idCell) {
  const cell = `
    <div class="cell" data-row="${idRow}" data-cell="${idCell}" style="background-color: ${color}"></div>
  `

  return cell
}

function resetGame() {
  queens = []
  initTimer(true)
  createGame()
}

// Validaciones
function validateBoard() {
  resetValidations()
  resetInvalidCells()

  for (const queen of queens) {
    const { row, cell } = queen

    const passRow = validateRow(row)
    const passCell = validateCell(cell)
    const passDiagonal = validateDiagonals(row, cell)
    const passSection = validateSections(row, cell)

    if (!passRow || !passCell || !passDiagonal || !passSection) {
      $('.cell[data-row="' + row + '"][data-cell="' + cell + '"]').classList.add('invalid')
    }
  }

  if (queens.length === 8) {
    const validQueens = queens.filter((queen) => queen.valid)

    if (validQueens.length === 8) {
      win()
      initTimer(true)
    }
  }
}

function resetValidations() {
  queens.forEach((queen) => (queen.valid = true))
}

function resetInvalidCells() {
  $$('.cell').forEach((cell) => {
    cell.classList.remove('invalid')
  })
}

function validateRow(row) {
  const queensInRow = queens.filter((queen) => queen.row === row)

  if (queensInRow.length > 1) {
    queensInRow.forEach((queen) => (queen.valid = false))
    return false
  }

  return true
}

function validateCell(cell) {
  const queensInCell = queens.filter((queen) => queen.cell === cell)

  if (queensInCell.length > 1) {
    queensInCell.forEach((queen) => (queen.valid = false))
    return false
  }

  return true
}

function validateDiagonals(row, cell) {
  const numCell = Number(row + cell)

  for (const queen of queens) {
    const numQueen = Number(queen.row + queen.cell)

    const diff = Math.abs(numCell - numQueen)

    if (diff === 9 || diff === 11) {
      queen.valid = false
      return false
    }
  }

  return true
}

function validateSections(row, cell) {
  const section = BOARD[row][cell]

  const queensInSection = queens.filter((queen) => {
    const { row, cell } = queen
    return BOARD[row][cell] === section
  })

  if (queensInSection.length > 1) {
    queensInSection.forEach((queen) => (queen.valid = false))
    return false
  }

  return true
}

createGame()

function win() {
  const end = Date.now() + 10 * 1000

  const colors = ['#bb0000', '#ffffff']

  ;(function frame() {
    confetti({
      particleCount: 2,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors: colors
    })

    confetti({
      particleCount: 2,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors: colors
    })

    if (Date.now() < end) {
      requestAnimationFrame(frame)
    }
  })()
}
