import React, {useCallback, useState} from 'react'
import {useDropzone} from 'react-dropzone'
import {formatSize} from '~/lib/utils'

interface FileUploaderProps {
    onFileselect ?: (file: File | null) => void;
}

const FileUploader = ({onFileselect} : FileUploaderProps) => {
    const maxSize = 20 * 1024 * 1024; // 20MB
    
    const onDrop = useCallback((acceptedFiles: File[]) => {
        const file = acceptedFiles[0] || null;
        onFileselect?.(file);
      }, [onFileselect])
      const {getRootProps, getInputProps, isDragActive, acceptedFiles} = useDropzone({onDrop, multiple: false, accept: {'application/pdf': ['.pdf']}, maxSize })

      const file = acceptedFiles[0] || null;
  return (
    <div className="w-full gradient-border">
        <div {...getRootProps()}>
    <input {...getInputProps()} />
    <div className="space-y-4 cursor-pointer text-center">
       
        {file ? (
            <div className="uploader-selected-file" onClick={(e) => e.stopPropagation()}>
                <img src="/images/pdf.png" alt="pdf" className="size-10" />
                <div className='flex items-center space-x-3'>
            <div>
                <p className="text-sm font-medium truncate max-w-xs text-gray-700 ">{file.name}</p>
               <p className="text-sm text-gray-500">{formatSize(file.size)}</p>
            </div>
               
           </div>
           <button>
            <img src="/icons/cross.svg" alt="remove" className="w-4 h-4" />
           </button>
            </div>
            
        ) : (
            <div>
                 <div className='mx-auto w-16 h-16 flex items-center justify-center mb-2'>
            <img src="/icons/info.svg" alt="upload" className="size-20" />
        </div>
                <p className="text-lg text-gray-500"><span className='font-semibold'>Click to upload</span> or drag or drop</p>
                <p className="text-sm text-gray-500">PDF (Max {formatSize(maxSize)})</p>
            </div>
        )}
    </div>
  </div></div>
  )
}

export default FileUploader