import { useEffect } from "react";
import { useNavigate } from "react-router";
import Navbar from "~/components/Navbar";
import ResumeCard from "~/components/ResumeCard";
import { usePuterStore } from "~/lib/puter";
import type { Route } from "./+types/home";
import {resumes} from "../../constants";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Ispani" },
    { name: "description", content: "Smart feedback for your resume" },
  ];
}

export default function Home() {
  const { auth } = usePuterStore();
const navigate = useNavigate();

  useEffect(() => {
    if (!auth.isAuthenticated) {
      navigate('/auth?next=/');
    }
  }, [auth.isAuthenticated]);

  return <main className="bg-[url('/images/bg-main.svg')] bg-cover">
    <Navbar/>
<section className="main-section">
<div className="page-heading py-16">
      <h1>Track Your Job Applications & CV ratings</h1>
      <h2>Get personalized feedback on your CVs and job applications using AI powered tools</h2>
    </div>
  

  {resumes.length > 0 && (
    <div className="resumes-section">
      {resumes.map((resume) => (
        <ResumeCard key={resume.id} resume={resume} />
      ))}
    </div>
  )}
  </section>
  </main>;
}
