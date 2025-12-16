import { useState, useEffect } from 'react'
import content from './data.json'

// ========== HAUPTKOMPONENTE ==========
export default function App() {
  const [phase, setPhase] = useState('start') // start, diagnostic, modules, final
  const [userProfile, setUserProfile] = useState({
    level: 'developing', // novice, developing, advanced
    errorPatterns: [],
    completedModules: [],
    badges: [],
    streak: 0
  })
  const [currentModule, setCurrentModule] = useState(null)
  const [progress, setProgress] = useState({
    tables: 0,
    graphs: 0,
    strategies: 0,
    context: 0
  })

  const handleDiagnosticComplete = (results) => {
    const { level, errors } = analyzeDiagnostic(results)
    setUserProfile(prev => ({ ...prev, level, errorPatterns: errors }))
    setPhase('modules')
  }

  const handleModuleComplete = (moduleName, badge) => {
    setUserProfile(prev => ({
      ...prev,
      completedModules: [...prev.completedModules, moduleName],
      badges: badge ? [...prev.badges, badge] : prev.badges
    }))
    setCurrentModule(null)
  }

  if (phase === 'start') {
    return <StartScreen onStart={() => setPhase('diagnostic')} />
  }

  if (phase === 'diagnostic') {
    return <DiagnosticQuiz onComplete={handleDiagnosticComplete} />
  }

  if (phase === 'modules' && !currentModule) {
    return (
      <ModuleSelector
        userProfile={userProfile}
        progress={progress}
        onSelectModule={setCurrentModule}
        onFinalChallenge={() => setPhase('final')}
      />
    )
  }

  if (currentModule) {
    return (
      <ModuleRunner
        module={currentModule}
        userProfile={userProfile}
        onComplete={(badge) => handleModuleComplete(currentModule, badge)}
        onBack={() => setCurrentModule(null)}
        onProgressUpdate={(module, value) =>
          setProgress(prev => ({ ...prev, [module]: value }))
        }
      />
    )
  }

  if (phase === 'final') {
    return (
      <FinalChallenge
        userProfile={userProfile}
        progress={progress}
        onRestart={() => {
          setPhase('start')
          setUserProfile({ level: 'developing', errorPatterns: [], completedModules: [], badges: [], streak: 0 })
          setProgress({ tables: 0, graphs: 0, strategies: 0, context: 0 })
        }}
      />
    )
  }

  return null
}

// ========== START SCREEN ==========
function StartScreen({ onStart }) {
  return (
    <div className="app-container">
      <div className="main-card">
        <div className="header">
          <h1>🎯 Zuordnungen meistern</h1>
          <p>Proportionale und antiproportionale Zuordnungen verstehen</p>
          <p style={{ marginTop: '10px', fontSize: '0.95rem', color: '#6b7280' }}>
            Gymnasium Klasse 7 • 90 Minuten
          </p>
        </div>
        <div style={{ maxWidth: '600px', margin: '40px auto', textAlign: 'center' }}>
          <h2 style={{ marginBottom: '20px', color: '#667eea' }}>Was erwartet dich?</h2>
          <div style={{ textAlign: 'left', lineHeight: '2' }}>
            <p>✓ Wertetabellen verstehen und vervollständigen</p>
            <p>✓ Graphen proportionaler Zuordnungen erkennen</p>
            <p>✓ Flexible Rechenstrategien entwickeln</p>
            <p>✓ Textaufgaben aus dem Alltag lösen</p>
          </div>
          <button className="button" onClick={onStart} style={{ marginTop: '40px', fontSize: '1.2rem', padding: '15px 40px' }}>
            Los geht's! 🚀
          </button>
        </div>
      </div>
    </div>
  )
}

// ========== DIAGNOSTIC QUIZ ==========
function DiagnosticQuiz({ onComplete }) {
  const [currentItem, setCurrentItem] = useState(0)
  const [answers, setAnswers] = useState([])
  const [selectedOption, setSelectedOption] = useState(null)

  const items = content.diagnostic.items
  const item = items[currentItem]

  const handleAnswer = () => {
    const isCorrect = item.options[selectedOption]?.correct
    setAnswers([...answers, { id: item.id, correct: isCorrect, errorType: item.options[selectedOption]?.errorType }])
    
    if (currentItem < items.length - 1) {
      setCurrentItem(currentItem + 1)
      setSelectedOption(null)
    } else {
      onComplete(answers.concat([{ id: item.id, correct: isCorrect, errorType: item.options[selectedOption]?.errorType }]))
    }
  }

  return (
    <div className="app-container">
      <div className="main-card">
        <div className="header">
          <h1>📋 Eingangsdiagnose</h1>
          <p>Frage {currentItem + 1} von {items.length}</p>
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${((currentItem + 1) / items.length) * 100}%` }} />
        </div>
        <div className="question-container">
          <div className="question-text">{item.question}</div>
          <div className="options-container">
            {item.options.map((opt, idx) => (
              <button
                key={idx}
                className={`option-button ${selectedOption === idx ? 'selected' : ''}`}
                onClick={() => setSelectedOption(idx)}
              >
                {opt.text}
              </button>
            ))}
          </div>
        </div>
        <div className="button-group">
          <button className="button" onClick={handleAnswer} disabled={selectedOption === null}>
            {currentItem < items.length - 1 ? 'Weiter' : 'Fertig'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ========== MODULE SELECTOR ==========
function ModuleSelector({ userProfile, progress, onSelectModule, onFinalChallenge }) {
  const modules = [
    { id: 'tables', name: 'Tabellen-Detektive', description: 'Zuordnungstypen erkennen', icon: '📊', badge: '🏆 Tabellen-Profi' },
    { id: 'graphs', name: 'Graphen-Labor', description: 'Graphen verstehen', icon: '📈', badge: '📊 Graphen-Experte' },
    { id: 'strategies', name: 'Rechen-Strategien', description: 'Flexibel rechnen', icon: '🧮', badge: '🧮 Rechen-Champion' },
    { id: 'context', name: 'Kontext-Profis', description: 'Textaufgaben lösen', icon: '🌟', badge: '🌟 Alltagsprofi' }
  ]

  const allCompleted = modules.every(m => userProfile.completedModules.includes(m.id))

  return (
    <div className="app-container">
      <div className="main-card">
        <div className="header">
          <h1>🎓 Deine Lernmodule</h1>
          <p>Wähle ein Modul oder fordere dich in der Final-Challenge heraus!</p>
        </div>
        {userProfile.badges.length > 0 && (
          <div className="badges-container">
            {userProfile.badges.map((badge, idx) => (
              <div key={idx} className="badge">{badge}</div>
            ))}
          </div>
        )}
        <div className="module-selector">
          {modules.map(module => (
            <div
              key={module.id}
              className={`module-card ${userProfile.completedModules.includes(module.id) ? 'completed' : ''}`}
              onClick={() => onSelectModule(module.id)}
            >
              <div style={{ fontSize: '3rem', marginBottom: '10px' }}>{module.icon}</div>
              <h3>{module.name}</h3>
              <p>{module.description}</p>
              {progress[module.id] > 0 && (
                <div style={{ marginTop: '15px', fontSize: '0.9rem', opacity: 0.9 }}>
                  Fortschritt: {progress[module.id]}%
                </div>
              )}
            </div>
          ))}
        </div>
        {allCompleted && (
          <div style={{ textAlign: 'center', marginTop: '40px' }}>
            <button className="button" onClick={onFinalChallenge} style={{ fontSize: '1.2rem', padding: '15px 40px' }}>
              🏆 Final-Challenge starten!
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// ========== MODULE RUNNER ==========
function ModuleRunner({ module, userProfile, onComplete, onBack, onProgressUpdate }) {
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0)
  const [completed, setCompleted] = useState(0)
  const [showFeedback, setShowFeedback] = useState(false)

  const getModuleTasks = () => {
    switch (module) {
      case 'tables':
        return [
          ...content.tables.recognition.map(t => ({ ...t, type: 'table-recognition' })),
          ...content.tables.completion.slice(0, 4).map(t => ({ ...t, type: 'table-completion' })),
          ...content.tables.errorDetection.map(t => ({ ...t, type: 'error-detection' }))
        ]
      case 'graphs':
        return [
          ...content.graphs.transformations.map(t => ({ ...t, type: 'graph-transformation' })),
          ...content.graphs.graphAsPicture.map(t => ({ ...t, type: 'graph-as-picture' })),
          ...content.graphs.comparison.map(t => ({ ...t, type: 'graph-comparison' }))
        ]
      case 'strategies':
        return [
          ...content.strategies.strategyChoice.map(t => ({ ...t, type: 'strategy-choice' })),
          ...content.strategies.mixed.map(t => ({ ...t, type: 'strategy-mixed' })),
          ...content.strategies.plausibility.map(t => ({ ...t, type: 'plausibility' }))
        ]
      case 'context':
        return [
          ...content.context.situationAssessment.map(t => ({ ...t, type: 'situation-assessment' })),
          ...content.context.simpleProblems.map(t => ({ ...t, type: 'simple-problem' })),
          ...content.context.overlinearizationTraps.map(t => ({ ...t, type: 'overlinearization-trap' }))
        ]
      default:
        return []
    }
  }

  const tasks = getModuleTasks()
  const task = tasks[currentTaskIndex]

  const handleNext = () => {
    if (currentTaskIndex < tasks.length - 1) {
      setCurrentTaskIndex(currentTaskIndex + 1)
      setShowFeedback(false)
    } else {
      const badge = getBadgeForModule(module)
      onComplete(badge)
    }
  }

  const handleTaskComplete = () => {
    const newCompleted = completed + 1
    setCompleted(newCompleted)
    setShowFeedback(true)
    onProgressUpdate(module, Math.round((newCompleted / tasks.length) * 100))
  }

  if (!task) return null

  return (
    <div className="app-container">
      <div className="main-card">
        <div className="header">
          <h1>{getModuleName(module)}</h1>
          <p>Aufgabe {currentTaskIndex + 1} von {tasks.length}</p>
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${((currentTaskIndex + 1) / tasks.length) * 100}%` }} />
        </div>
        <TaskRenderer
          task={task}
          userProfile={userProfile}
          onComplete={handleTaskComplete}
          showFeedback={showFeedback}
        />
        <div className="button-group">
          <button className="button button-secondary" onClick={onBack}>
            Zurück
          </button>
          {showFeedback && (
            <button className="button" onClick={handleNext}>
              {currentTaskIndex < tasks.length - 1 ? 'Nächste Aufgabe' : 'Modul abschließen'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ========== TASK RENDERER ==========
function TaskRenderer({ task, userProfile, onComplete, showFeedback }) {
  const [answer, setAnswer] = useState(null)
  const [inputValues, setInputValues] = useState({})
  const [hintLevel, setHintLevel] = useState(0)

  if (task.type === 'table-recognition') {
    return (
      <TableRecognitionTask
        task={task}
        answer={answer}
        setAnswer={setAnswer}
        showFeedback={showFeedback}
        onComplete={onComplete}
        hintLevel={hintLevel}
        setHintLevel={setHintLevel}
      />
    )
  }

  if (task.type === 'table-completion') {
    return (
      <TableCompletionTask
        task={task}
        inputValues={inputValues}
        setInputValues={setInputValues}
        showFeedback={showFeedback}
        onComplete={onComplete}
      />
    )
  }

  if (task.type === 'strategy-choice' || task.type === 'strategy-mixed') {
    return (
      <StrategyTask
        task={task}
        answer={answer}
        setAnswer={setAnswer}
        showFeedback={showFeedback}
        onComplete={onComplete}
        hintLevel={hintLevel}
        setHintLevel={setHintLevel}
      />
    )
  }

  if (task.type === 'simple-problem') {
    return (
      <TextProblemTask
        task={task}
        answer={answer}
        setAnswer={setAnswer}
        showFeedback={showFeedback}
        onComplete={onComplete}
        hintLevel={hintLevel}
        setHintLevel={setHintLevel}
      />
    )
  }

  if (task.type === 'situation-assessment') {
    return (
      <SituationTask
        task={task}
        answer={answer}
        setAnswer={setAnswer}
        showFeedback={showFeedback}
        onComplete={onComplete}
      />
    )
  }

  if (task.type === 'overlinearization-trap') {
    return (
      <OverlinearizationTask
        task={task}
        answer={answer}
        setAnswer={setAnswer}
        showFeedback={showFeedback}
        onComplete={onComplete}
      />
    )
  }

  // Default fallback
  return <div className="question-container"><p>Aufgabentyp wird geladen...</p></div>
}

// ========== TABLE RECOGNITION TASK ==========
function TableRecognitionTask({ task, answer, setAnswer, showFeedback, onComplete, hintLevel, setHintLevel }) {
  const options = ['proportional', 'antiproportional', 'none']
  const labels = { proportional: 'Proportional', antiproportional: 'Antiproportional', none: 'Keine von beiden' }

  const handleCheck = () => {
    if (answer === task.correct) {
      onComplete()
    } else {
      // Show feedback but don't complete yet
    }
  }

  return (
    <div className="question-container">
      <div className="question-text">Welche Zuordnung liegt vor?</div>
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>x</th>
              {task.data.map((row, idx) => <th key={idx}>{row[0]}</th>)}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ fontWeight: 'bold' }}>y</td>
              {task.data.map((row, idx) => <td key={idx}>{row[1]}</td>)}
            </tr>
          </tbody>
        </table>
      </div>
      <div className="options-container">
        {options.map(opt => (
          <button
            key={opt}
            className={`option-button ${answer === opt ? 'selected' : ''} ${
              showFeedback ? (opt === task.correct ? 'correct' : answer === opt ? 'incorrect' : '') : ''
            }`}
            onClick={() => !showFeedback && setAnswer(opt)}
            disabled={showFeedback}
          >
            {labels[opt]}
          </button>
        ))}
      </div>
      {showFeedback && (
        <div className={`feedback ${answer === task.correct ? 'success' : 'error'}`}>
          {task.feedback[answer === task.correct ? 'correct' : answer]}
        </div>
      )}
      {!showFeedback && task.hints && (
        <div className="hint-system">
          {hintLevel < task.hints.length && (
            <button className="hint-button" onClick={() => setHintLevel(hintLevel + 1)}>
              💡 Hilfe anzeigen ({hintLevel + 1}/3)
            </button>
          )}
          {hintLevel > 0 && (
            <div className="hint-content">
              <strong>Tipp {hintLevel}:</strong> {task.hints[hintLevel - 1]}
            </div>
          )}
        </div>
      )}
      {!showFeedback && (
        <div className="button-group">
          <button className="button" onClick={handleCheck} disabled={!answer}>
            Prüfen
          </button>
        </div>
      )}
    </div>
  )
}

// ========== TABLE COMPLETION TASK ==========
function TableCompletionTask({ task, inputValues, setInputValues, showFeedback, onComplete }) {
  const handleCheck = () => {
    let allCorrect = true
    task.data.forEach((row, rowIdx) => {
      row.forEach((cell, colIdx) => {
        if (cell === null) {
          const key = `${rowIdx}-${colIdx}`
          const expected = task.solution[rowIdx][colIdx]
          if (Math.abs(parseFloat(inputValues[key]) - expected) > 0.01) {
            allCorrect = false
          }
        }
      })
    })
    if (allCorrect) onComplete()
  }

  return (
    <div className="question-container">
      <div className="question-text">{task.description}</div>
      <div className="table-container">
        <table>
          <tbody>
            {task.data.map((row, rowIdx) => (
              <tr key={rowIdx}>
                {row.map((cell, colIdx) => (
                  <td key={colIdx}>
                    {cell === null ? (
                      <input
                        type="number"
                        step="0.1"
                        className={`input-field ${
                          showFeedback
                            ? Math.abs(parseFloat(inputValues[`${rowIdx}-${colIdx}`]) - task.solution[rowIdx][colIdx]) < 0.01
                              ? 'correct'
                              : 'incorrect'
                            : ''
                        }`}
                        value={inputValues[`${rowIdx}-${colIdx}`] || ''}
                        onChange={(e) => setInputValues({ ...inputValues, [`${rowIdx}-${colIdx}`]: e.target.value })}
                        disabled={showFeedback}
                      />
                    ) : (
                      cell
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {showFeedback && (
        <div className="feedback success">✓ Sehr gut! Alle Werte sind korrekt.</div>
      )}
      {!showFeedback && (
        <div className="button-group">
          <button className="button" onClick={handleCheck}>
            Prüfen
          </button>
        </div>
      )}
    </div>
  )
}

// ========== STRATEGY TASK ==========
function StrategyTask({ task, answer, setAnswer, showFeedback, onComplete, hintLevel, setHintLevel }) {
  const handleCheck = () => {
    if (Math.abs(parseFloat(answer) - task.solution) < 0.01) {
      onComplete()
    }
  }

  return (
    <div className="question-container">
      <div className="question-text">{task.question}</div>
      <div style={{ margin: '20px 0' }}>
        <input
          type="number"
          step="0.01"
          className="input-field"
          style={{ width: '150px' }}
          value={answer || ''}
          onChange={(e) => setAnswer(e.target.value)}
          disabled={showFeedback}
          placeholder="Deine Antwort"
        />
      </div>
      {showFeedback && (
        <div className={`feedback ${Math.abs(parseFloat(answer) - task.solution) < 0.01 ? 'success' : 'error'}`}>
          {Math.abs(parseFloat(answer) - task.solution) < 0.01
            ? '✓ Richtig! Deine Strategie funktioniert!'
            : `⚠️ Nicht ganz. Die richtige Lösung ist ${task.solution}.`}
        </div>
      )}
      {!showFeedback && task.hints && (
        <div className="hint-system">
          {hintLevel < task.hints.length && (
            <button className="hint-button" onClick={() => setHintLevel(hintLevel + 1)}>
              💡 Hilfe anzeigen ({hintLevel + 1}/{task.hints.length})
            </button>
          )}
          {hintLevel > 0 && (
            <div className="hint-content">
              <strong>Tipp {hintLevel}:</strong> {task.hints[hintLevel - 1]}
            </div>
          )}
        </div>
      )}
      {!showFeedback && (
        <div className="button-group">
          <button className="button" onClick={handleCheck} disabled={!answer}>
            Prüfen
          </button>
        </div>
      )}
    </div>
  )
}

// ========== TEXT PROBLEM TASK ==========
function TextProblemTask({ task, answer, setAnswer, showFeedback, onComplete, hintLevel, setHintLevel }) {
  const handleCheck = () => {
    if (Math.abs(parseFloat(answer) - task.solution) < 0.01) {
      onComplete()
    }
  }

  return (
    <div className="question-container">
      <div className="question-text">{task.text}</div>
      <div style={{ margin: '20px 0' }}>
        <input
          type="number"
          step="0.01"
          className="input-field"
          style={{ width: '150px' }}
          value={answer || ''}
          onChange={(e) => setAnswer(e.target.value)}
          disabled={showFeedback}
          placeholder="Deine Antwort"
        />
        {task.unit && <span style={{ marginLeft: '10px' }}>{task.unit}</span>}
      </div>
      {showFeedback && (
        <div className={`feedback ${Math.abs(parseFloat(answer) - task.solution) < 0.01 ? 'success' : 'error'}`}>
          {Math.abs(parseFloat(answer) - task.solution) < 0.01
            ? '✓ Perfekt gelöst!'
            : `⚠️ Nicht ganz. Die richtige Lösung ist ${task.solution} ${task.unit}.`}
        </div>
      )}
      {!showFeedback && task.hints && (
        <div className="hint-system">
          {hintLevel < task.hints.length && (
            <button className="hint-button" onClick={() => setHintLevel(hintLevel + 1)}>
              💡 Hilfe anzeigen ({hintLevel + 1}/{task.hints.length})
            </button>
          )}
          {hintLevel > 0 && (
            <div className="hint-content">
              <strong>Tipp {hintLevel}:</strong> {task.hints[hintLevel - 1]}
            </div>
          )}
        </div>
      )}
      {!showFeedback && (
        <div className="button-group">
          <button className="button" onClick={handleCheck} disabled={!answer}>
            Prüfen
          </button>
        </div>
      )}
    </div>
  )
}

// ========== SITUATION TASK ==========
function SituationTask({ task, answer, setAnswer, showFeedback, onComplete }) {
  const options = ['proportional', 'antiproportional', 'none', 'false-overlinearization']
  const labels = {
    proportional: 'Proportional',
    antiproportional: 'Antiproportional',
    none: 'Keine von beiden',
    'false-overlinearization': 'Falsch (Überlinearisierung)'
  }

  const handleCheck = () => {
    if (answer === task.correct) {
      onComplete()
    }
  }

  return (
    <div className="question-container">
      <div className="question-text">{task.situation}</div>
      <div className="options-container">
        {options.map(opt => (
          <button
            key={opt}
            className={`option-button ${answer === opt ? 'selected' : ''} ${
              showFeedback ? (opt === task.correct ? 'correct' : answer === opt ? 'incorrect' : '') : ''
            }`}
            onClick={() => !showFeedback && setAnswer(opt)}
            disabled={showFeedback}
          >
            {labels[opt]}
          </button>
        ))}
      </div>
      {showFeedback && (
        <div className={`feedback ${answer === task.correct ? 'success' : 'error'}`}>
          {task.explanation}
        </div>
      )}
      {!showFeedback && (
        <div className="button-group">
          <button className="button" onClick={handleCheck} disabled={!answer}>
            Prüfen
          </button>
        </div>
      )}
    </div>
  )
}

// ========== OVERLINEARIZATION TASK ==========
function OverlinearizationTask({ task, answer, setAnswer, showFeedback, onComplete }) {
  const handleCheck = () => {
    const selectedOption = task.options.find(opt => opt.value === parseInt(answer))
    if (selectedOption?.correct) {
      onComplete()
    }
  }

  return (
    <div className="question-container">
      <div className="question-text">{task.text}</div>
      <div className="options-container">
        {task.options.map(opt => (
          <button
            key={opt.value}
            className={`option-button ${answer == opt.value ? 'selected' : ''} ${
              showFeedback ? (opt.correct ? 'correct' : answer == opt.value ? 'incorrect' : '') : ''
            }`}
            onClick={() => !showFeedback && setAnswer(opt.value)}
            disabled={showFeedback}
          >
            {opt.value}
          </button>
        ))}
      </div>
      {showFeedback && (
        <div className={`feedback ${task.options.find(o => o.value === parseInt(answer))?.correct ? 'success' : 'error'}`}>
          {task.feedback[answer] || task.feedback[parseInt(answer)]}
        </div>
      )}
      {!showFeedback && (
        <div className="button-group">
          <button className="button" onClick={handleCheck} disabled={!answer}>
            Prüfen
          </button>
        </div>
      )}
    </div>
  )
}

// ========== FINAL CHALLENGE ==========
function FinalChallenge({ userProfile, progress, onRestart }) {
  const [currentProblem, setCurrentProblem] = useState(0)
  const [score, setScore] = useState(0)
  const problems = content.finalChallenge.problems

  if (currentProblem >= problems.length) {
    return (
      <div className="app-container">
        <div className="main-card">
          <div className="header">
            <h1>🎉 Geschafft!</h1>
            <p>Du hast die Final-Challenge gemeistert!</p>
          </div>
          <div className="stats-container">
            <div className="stat-card">
              <div className="stat-label">Punkte</div>
              <div className="stat-value">{score}/{problems.length}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Module gemeistert</div>
              <div className="stat-value">{userProfile.completedModules.length}/4</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Badges erhalten</div>
              <div className="stat-value">{userProfile.badges.length}</div>
            </div>
          </div>
          {userProfile.badges.length > 0 && (
            <div>
              <h3 style={{ textAlign: 'center', margin: '30px 0' }}>Deine Badges:</h3>
              <div className="badges-container">
                {userProfile.badges.map((badge, idx) => (
                  <div key={idx} className="badge">{badge}</div>
                ))}
              </div>
            </div>
          )}
          <div className="reflection-form">
            <h3 style={{ marginBottom: '20px' }}>Was hast du gelernt?</h3>
            <div className="checkbox-group">
              <label className="checkbox-label">
                <input type="checkbox" /> Proportionale Zuordnungen erkennen
              </label>
              <label className="checkbox-label">
                <input type="checkbox" /> Antiproportionale Zuordnungen erkennen
              </label>
              <label className="checkbox-label">
                <input type="checkbox" /> Graphen interpretieren
              </label>
              <label className="checkbox-label">
                <input type="checkbox" /> Verschiedene Rechenstrategien anwenden
              </label>
              <label className="checkbox-label">
                <input type="checkbox" /> Textaufgaben lösen
              </label>
            </div>
          </div>
          <div className="button-group">
            <button className="button" onClick={onRestart} style={{ fontSize: '1.1rem', padding: '12px 30px' }}>
              Nochmal starten 🔄
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="app-container">
      <div className="main-card">
        <div className="header">
          <h1>🏆 Final-Challenge</h1>
          <p>Aufgabe {currentProblem + 1} von {problems.length}</p>
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${((currentProblem + 1) / problems.length) * 100}%` }} />
        </div>
        <div className="question-container">
          <p style={{ textAlign: 'center', fontSize: '1.2rem', marginTop: '40px' }}>
            Challenge läuft... Zeige dein Können! 💪
          </p>
          <div className="button-group" style={{ marginTop: '40px' }}>
            <button 
              className="button" 
              onClick={() => {
                setScore(score + 1)
                setCurrentProblem(currentProblem + 1)
              }}
            >
              Aufgabe gelöst
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ========== HELPER FUNCTIONS ==========
function analyzeDiagnostic(results) {
  const correctCount = results.filter(r => r.correct).length
  const errors = results.filter(r => !r.correct && r.errorType).map(r => r.errorType)
  
  let level = 'developing'
  if (correctCount <= 2) level = 'novice'
  else if (correctCount >= 4) level = 'advanced'
  
  return { level, errors }
}

function getModuleName(module) {
  const names = {
    tables: '📊 Tabellen-Detektive',
    graphs: '📈 Graphen-Labor',
    strategies: '🧮 Rechen-Strategien',
    context: '🌟 Kontext-Profis'
  }
  return names[module] || module
}

function getBadgeForModule(module) {
  const badges = {
    tables: '🏆 Tabellen-Profi',
    graphs: '📊 Graphen-Experte',
    strategies: '🧮 Rechen-Champion',
    context: '🌟 Alltagsprofi'
  }
  return badges[module]
}
