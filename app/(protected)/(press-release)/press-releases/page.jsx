'use client';

import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import axios from '@/lib/axiosInstance';
import { getPressReleaseUrl } from '@/lib/pressReleaseApi';
import { Languages, Newspaper, Pencil, PlusCircle } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

const languageLabels = {
  eng: 'English',
  hin: 'Hindi',
  en: 'English',
  hi: 'Hindi',
  English: 'English',
  Hindi: 'Hindi',
};

const formatDate = (value) => {
  if (!value) return '-';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const stripHtml = (value = '') =>
  value
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const getLanguageLabel = (pressRelease) => {
  const language = pressRelease.lang || pressRelease.language || '';
  return languageLabels[language] || language || '-';
};

const getReleaseDate = (pressRelease) => {
  if (pressRelease.day && pressRelease.month && pressRelease.year) {
    return `${String(pressRelease.day).padStart(2, '0')} ${
      pressRelease.month
    } ${pressRelease.year}`;
  }

  return formatDate(pressRelease.date);
};

const getReleaseTitle = (pressRelease) =>
  pressRelease.title || pressRelease.newspaper || '-';

const getReleaseSummary = (pressRelease) =>
  stripHtml(pressRelease.content || pressRelease.headline || '');

const getMediaLabel = (pressRelease) => {
  const media = [];
  const imageCount = Array.isArray(pressRelease.images)
    ? pressRelease.images.length
    : 0;

  if (imageCount) media.push(`${imageCount} image${imageCount > 1 ? 's' : ''}`);
  if (pressRelease.youtubeVideoId) media.push('Video');

  return media.join(', ') || '-';
};

const isLanguage = (pressRelease, options) => {
  const language = String(pressRelease.lang || pressRelease.language || '')
    .trim()
    .toLowerCase();

  return options.includes(language);
};

const Page = () => {
  const [pressReleases, setPressReleases] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  async function getPressReleases() {
    try {
      setIsLoading(true);
      const res = await axios.get(getPressReleaseUrl('/get-all-releases'));

      setPressReleases(res.data.data.pressReleases || []);
    } catch (err) {
      console.log(err);
      toast.error('Unable to load press releases');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    getPressReleases();
  }, []);

  const englishCount = pressReleases.filter(
    (pressRelease) => isLanguage(pressRelease, ['english', 'eng', 'en'])
  ).length;
  const hindiCount = pressReleases.filter(
    (pressRelease) => isLanguage(pressRelease, ['hindi', 'hin', 'hi'])
  ).length;

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-rose-700">
              Media Coverage
            </p>
            <h1 className="mt-2 text-3xl font-bold text-slate-950">
              Press Releases
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              Track published releases across themes, initiatives, and languages.
            </p>
          </div>
          <Button asChild>
            <Link href="/press-releases/create-press-release">
              <PlusCircle className="h-4 w-4" />
              Post A Press Release
            </Link>
          </Button>
        </div>

        <div className="mb-5 grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-md bg-rose-50 text-rose-700">
              <Newspaper className="h-4 w-4" />
            </div>
            <p className="text-sm text-slate-600">Total Releases</p>
            <p className="mt-1 text-2xl font-bold text-slate-950">
              {pressReleases.length}
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-md bg-emerald-50 text-emerald-700">
              <Languages className="h-4 w-4" />
            </div>
            <p className="text-sm text-slate-600">English</p>
            <p className="mt-1 text-2xl font-bold text-slate-950">
              {englishCount}
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-md bg-amber-50 text-amber-700">
              <Languages className="h-4 w-4" />
            </div>
            <p className="text-sm text-slate-600">Hindi</p>
            <p className="mt-1 text-2xl font-bold text-slate-950">
              {hindiCount}
            </p>
          </div>
        </div>

        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead>S.No</TableHead>
                  <TableHead className="min-w-[320px]">Press Release</TableHead>
                  <TableHead className="min-w-[160px]">Thematic Area</TableHead>
                  <TableHead className="min-w-[160px]">Initiative</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Language</TableHead>
                  <TableHead>Media</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading && (
                  <TableRow>
                    <TableCell colSpan={8} className="py-8 text-center">
                      Loading press releases...
                    </TableCell>
                  </TableRow>
                )}

                {!isLoading && pressReleases.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="py-8 text-center">
                      No press releases found.
                    </TableCell>
                  </TableRow>
                )}

                {!isLoading &&
                  pressReleases.map((pressRelease, index) => (
                    <TableRow key={pressRelease._id}>
                      <TableCell className="font-medium">
                        {index + 1}
                      </TableCell>
                      <TableCell>
                        <p className="font-medium text-slate-950">
                          {getReleaseTitle(pressRelease)}
                        </p>
                        {getReleaseSummary(pressRelease) && (
                          <p className="mt-1 max-w-xl truncate text-xs text-slate-500">
                            {getReleaseSummary(pressRelease)}
                          </p>
                        )}
                      </TableCell>
                      <TableCell>{pressRelease.thematicArea || '-'}</TableCell>
                      <TableCell>{pressRelease.initiative || '-'}</TableCell>
                      <TableCell>{getReleaseDate(pressRelease)}</TableCell>
                      <TableCell>{getLanguageLabel(pressRelease)}</TableCell>
                      <TableCell>
                        {getMediaLabel(pressRelease)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button asChild size="sm" variant="outline">
                          <Link
                            href={`/press-releases/edit-press-release/${pressRelease._id}`}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                            Edit
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
