import ScoreGauge from './ScoreGauge'
import ScoreBadge from './ScoreBadge'
import { computeOverallScore } from '~/lib/utils'

const Category = ({ title, score }: { title: string, score: number }) => {
    const textColor = score > 70 ? 'text-green-600' : score > 49 ? 'text-yellow-600' : 'text-red-600';

  return (
    <div className="flex flex-row gap-2 items-center bg-gray-50 rounded-2xl p-4 w-full justify-between">
      <div className="flex flex-row gap-2 items-center">
        <p className="text-lg">{title}</p>
        <ScoreBadge score={score} />
      </div>
      <p className="text-lg"> 
        <span className={textColor}>{score}</span>/100
      </p>
    </div>
  )
}

interface SummaryProps {
  feedback: any;
}

const Summary = ({ feedback }: SummaryProps) => {
  return (
    <div className="bg-white rounded-2xl shadow-md w-full">
        <div className="flex flex-row items-center p-4 gap-8">
            <ScoreGauge score={computeOverallScore(feedback)}/>
            <div className="flex flex-col gap-2">
                <h2 className="text-2xl font-bold">Your CV score</h2>
                <p className="text-sm text-gray-500">Your CV score is based on the variables below</p>
            </div>
        </div>
        <div className="flex flex-col px-4 pb-4 gap-2">
            <Category title="Tone & Style" score={feedback.toneAndStyle.score}/>
            <Category title="Content" score={feedback.content.score}/>
            <Category title="Structure" score={feedback.structure.score}/>
            <Category title="Skills" score={feedback.skills.score}/>
        </div>
    </div>
  )
}

export default Summary
