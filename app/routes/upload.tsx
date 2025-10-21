import {useState, type FormEvent, useEffect} from 'react'
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
    
    useEffect(() => {
      if (!isLoading && !auth.isAuthenticated) {
        navigate('/auth?next=/upload');
      }
    }, [auth.isAuthenticated, isLoading, navigate]);
    
    const handleFileSelect = (file: File | null) => {
      setFile(file)
    }

    const handleAnalyze = async ({CompanyName, JobTitle, JobDescription, File}: {CompanyName: string, JobTitle: string, JobDescription: string, File: File  }) => 
      { 
        try {
          console.log('Starting CV analysis...');
          setIsProcessing(true);
          setStatusText('Uploading your CV...');
          
          console.log('Uploading file to Puter...');
          const uploadFile = await fs.upload([File]);
          console.log('Upload result:', uploadFile); 

          if(!uploadFile) {
            setStatusText('Failed to upload your CV. Please try again.');
            setIsProcessing(false);
            return;
          }

          setStatusText('Converting to image...');
          console.log('Converting PDF to image...');
          const imageFile = await convertPdfToImage(File);
          console.log('Image conversion result:', imageFile);
          if (!imageFile.file) {
            setStatusText('Error: Failed to convert PDF to image');
            setIsProcessing(false);
            return;
          }

          setStatusText('Uploading image...');
          console.log('Uploading image to Puter...');
          const uploadedImage = await fs.upload([imageFile.file as File]);
          console.log('Image upload result:', uploadedImage);
          if (!uploadedImage) {
            setStatusText('Error: Failed to upload image');
            setIsProcessing(false);
            return;
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
          console.log('Saving initial data to KV...');
          await kv.set(`resume:${uuid}`, JSON.stringify(data));
          setStatusText('Analyzing your CV with AI...');
          console.log('Calling AI feedback...');
          const feedback = await ai.feedback(uploadedImage.path, prepareInstructions({jobTitle: JobTitle, jobDescription: JobDescription, AIResponseFormat}))
          console.log('AI feedback response:', feedback);

          if(!feedback) {
            setStatusText('Error: Failed to analyze your CV');
            setIsProcessing(false);
            return;
          }

          // Check if the response indicates an error
          if (feedback && typeof feedback === 'object' && 'success' in feedback && !feedback.success) {
            const errorMsg = feedback.error?.message || 'Unknown error occurred';
            if (errorMsg.includes('usage-limited') || errorMsg.includes('Permission denied')) {
              throw new Error('AI usage limit reached. Please try again later or upgrade your Puter account.');
            }
            throw new Error(errorMsg);
          }

          let feedbackText = typeof feedback.message.content === 'string' ? feedback.message.content : feedback.message.content[0].text;

          console.log('Raw AI feedback:', feedbackText);

          // Clean the feedback text - remove markdown code blocks if present
          let cleanedFeedback = feedbackText.trim();
          
          // Remove markdown code blocks (```json ... ``` or ``` ... ```)
          if (cleanedFeedback.startsWith('```')) {
            cleanedFeedback = cleanedFeedback.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
          }
          
          // Try to find JSON object if there's extra text
          const jsonMatch = cleanedFeedback.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            cleanedFeedback = jsonMatch[0];
          }

          console.log('Cleaned feedback before parsing:', cleanedFeedback);
          
          try {
            data.feedback = JSON.parse(cleanedFeedback);
          } catch (parseError) {
            console.error('JSON Parse Error:', parseError);
            console.error('Failed to parse this text:', cleanedFeedback);
            throw new Error('AI returned invalid JSON. Please try again.');
          }
          
          await kv.set(`resume:${uuid}`, JSON.stringify(data));
          setStatusText('CV analyzed successfully, redirecting to result page...');
          console.log('Successfully parsed data:', data);
          navigate(`/resume/${uuid}`);
        } catch (error) {
          console.error('Error analyzing CV:', error);
          setStatusText(`Error: ${error instanceof Error ? error.message : 'Failed to analyze CV. Please ensure you are signed in to Puter.'}`);
          setIsProcessing(false);
        }

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