'use client';

import React from 'react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getBaseUrl, setBaseUrl } from '@/lib/electron/base-url';
import Image from 'next/image';
import Input from '@/components/mini/text-fields/input';
import Button from '@/components/mini/buttons/form-buttons/button';
import Link from 'next/link';

export default function APIPrompt() {
  const router = useRouter();
  const [baseUrl, setBaseUrlState] = useState<string | null>(null);

  return (
    <div className='flex flex-col items-center md:w-96 w-full text-center'>
      <Image 
        src="/logos/main.png"
        alt="Logo"
        width={100}
        height={100}
        className="mb-7"
      />
      <h1 className="text-2xl font-bold" style={{color: '#00897A'}}>Locate your API</h1>
      <p className='text-sm text-slate-900'>Enter the API URL to perform health check</p>
      <Input
        type="text"
        placeholder="https://www.bindex.com"
        value={baseUrl || ''}
        onChange={(e) => {
          setBaseUrlState(e.target.value);
        }}
      />
      <Button
        text="Locate the API"
        loading={false}
        disabled={false}
        onClick={() => {
          router.push('/trainer');
        }}
      />
      <p className='text-sm text-[#828282] mt-4'>By clicking this, an <span className='text-black'>health check</span> will be performed to continue operations. <Link href={'#'} style={{color: '#00897A'}}>Read more.</Link></p>
    </div>
    
  );
}
