import {useState, type FormEvent} from 'react'
import { useNavigate } from 'react-router'
import Navbar from '../components/Navbar'
import FileUploader from '../components/FileUploader'
import { usePuterStore } from '~/lib/puter'
import { convertPdfToImage } from '~/lib/pdf2image'
import { generateUUID } from '~/lib/utils';
import { prepareInstructions, AIResponseFormat } from '../../constants';

const Upload = () => {
    const{ auth, isLoading, fs, ai, kv } = usePuterStore();
    const navigate = useNavigate();
    const [isProcessing, setIsProcessing] = useState(false)
    const [statusText,  setStatusText] = useState<string>('');

    const [file, setFile] = useState<File | null>(null)
    
    const handleFileSelect = (file: File | null) => {
      setFile(file)
    }

    const handleAnalyze = async ({CompanyName, JobTitle, JobDescription, File}: {CompanyName: string, JobTitle: string, JobDescription: string, File: File  }) => 
      { 
        setIsProcessing(true);
        setStatusText('Analyzing your CV...');
        const uploadFile = await fs.upload([File]); 

        if(!uploadFile) {
          return setStatusText('Failed to upload your CV');
        }

        setStatusText('Converting to image...');
        const imageFile = await convertPdfToImage(File);
        if (!imageFile.file) {
          return setStatusText('Error: Failed to convert PDF to image');
        }

        setStatusText('Uploading image...');
        const uploadedImage = await fs.upload([imageFile.file as File]);
        if (!uploadedImage) {
          return setStatusText('Error: Failed to upload image');
        }

        setStatusText('Preparing data...');

        const uuid = generateUUID();
        const data = {
          id: uuid,
          resumePath: uploadFile.path,
          imagePath: uploadedImage.path,
          companyName: CompanyName,
          jobTitle: JobTitle,
          jobDescription: JobDescription,
          feedback: '',
        }
        await kv.set(`resume:${uuid}`, JSON.stringify(data));
        setStatusText('Analyzing your CV...');
        const feedback = await ai.feedback(uploadedImage.path, prepareInstructions({jobTitle: JobTitle, jobDescription: JobDescription, AIResponseFormat}))

        if(!feedback) {
          return setStatusText('Error: Failed to analyze your CV');
        }

        const feedbackText = typeof feedback.message.content === 'string' ? feedback.message.content : feedback.message.content[0].text;

        data.feedback = JSON.parse(feedbackText);
        await kv.set(`resume:${uuid}`, JSON.stringify(data));
        setStatusText('CV analyzed successfully, redirecting to result page...');
        console.log(data);

      }

      

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const form = e.currentTarget.closest('form');
      if(!form) {
        return;
      }
      const formData = new FormData(form);

      const companyName = formData.get('company-name') as string ; 
      const jobTitle = formData.get('job-title') as string;
      const jobDescription = formData.get('job-description') as string;

      if(!file) {
        return;
      }

      handleAnalyze({CompanyName: companyName, JobTitle: jobTitle, JobDescription: jobDescription, File: file});
    }
  return (
    <main className="bg-[url('/images/bg-main.svg')] bg-cover">
    <Navbar/>
<section className="main-section">
<div className="page-heading py-16">
    <h1>Smart feedback for your dream job</h1>
    {isProcessing ? (<>
    <h2>{statusText}</h2>
    <img src="/images/resume-scan.gif" className="w-full" />
    </>) : (<h2>Drop your CV for an ATS score and improvement tips</h2>)}

    {!isProcessing && (
        <form id="upload-form" onSubmit={handleSubmit} className="flex flex-col gap-4 mt-8">
           <div className='form-div'>
            <label htmlFor="company-name">Company Name</label>
            <input type="text" id="company-name" name="company-name" placeholder='Company Name' />
            </div>

            <div className='form-div'>
            <label htmlFor="job-title">Job Title</label>
            <input type="text" id="job-title" name="job-title" placeholder='Job Title' />
            </div>

            <div className='form-div'>
            <label htmlFor="job-description">Job Description</label>
            <textarea rows={5} id="job-description" name="job-description" placeholder='Job Description' />
            </div>

            <div className='form-div'>
            <label htmlFor="upload-resume">Upload CV</label>
            <FileUploader onFileselect={handleFileSelect} />
            </div>

            <button className="primary-button" type="submit">Analyze CV</button>
        </form>
    )}

    </div>
</section>
</main>
  )
}

export default Upload