'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import axios from '@/lib/axiosInstance';
import { getPressReleaseUrl } from '@/lib/pressReleaseApi';
import { ArrowLeft, ImagePlus, Send } from 'lucide-react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';
import toast from 'react-hot-toast';

const JoditEditor = dynamic(() => import('jodit-react'), { ssr: false });

const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

const extractYoutubeVideoId = (value) => {
  const trimmedValue = value.trim();

  if (!trimmedValue) return '';

  const patterns = [
    /youtu\.be\/([^?&/]+)/,
    /[?&]v=([^?&/]+)/,
    /\/embed\/([^?&/]+)/,
    /\/shorts\/([^?&/]+)/,
  ];

  const matchedPattern = patterns.find((pattern) => pattern.test(trimmedValue));
  const matchedValue = matchedPattern
    ? trimmedValue.match(matchedPattern)?.[1]
    : trimmedValue;

  return matchedValue || trimmedValue;
};

const hasReadableContent = (value) =>
  value.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim().length > 0;

const Page = () => {
  const router = useRouter();
  const editor = useRef(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    publishedDate: '',
    lang: 'English',
    thematicArea: '',
    initiative: '',
    youtubeVideoId: '',
  });
  const [images, setImages] = useState([]);

  const handleContentChange = (value) => {
    setFormData((prev) => ({ ...prev, content: value }));
  };

  const handleImagesChange = (e) => {
    const selectedImages = Array.from(e.target.files || []).slice(0, 10);
    setImages(selectedImages);
  };

  const buildPressReleasePayload = () => {
    const [year, month, day] = formData.publishedDate.split('-');
    const payload = new FormData();

    payload.append('title', formData.title.trim());
    payload.append('content', formData.content);
    payload.append('thematicArea', formData.thematicArea.trim());
    payload.append('initiative', formData.initiative.trim());
    payload.append('lang', formData.lang);
    payload.append('day', Number(day));
    payload.append('month', MONTHS[Number(month) - 1]);
    payload.append('year', Number(year));

    const youtubeVideoId = extractYoutubeVideoId(formData.youtubeVideoId);
    if (youtubeVideoId) payload.append('youtubeVideoId', youtubeVideoId);

    images.forEach((image) => {
      payload.append('images', image);
    });

    return payload;
  };

  const validateForm = () => {
    if (!hasReadableContent(formData.content)) {
      toast.error('Please enter press release content');
      return false;
    }

    if (!formData.publishedDate) {
      toast.error('Please select a release date');
      return false;
    }

    return true;
  };

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      publishedDate: '',
      lang: 'English',
      thematicArea: '',
      initiative: '',
      youtubeVideoId: '',
    });
    setImages([]);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePressReleaseSubmission = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setIsSubmitting(true);

      await axios.post(
        getPressReleaseUrl('/create-press-release'),
        buildPressReleasePayload()
      );

      toast.success('Press release published');
      resetForm();
      router.push('/press-releases');
    } catch (err) {
      console.log(err);
      toast.error(
        err.response?.data?.message || 'Unable to publish press release'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-rose-700">
              Media Coverage
            </p>
            <h1 className="mt-2 text-3xl font-bold text-slate-950">
              Post A Press Release
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              Publish a press release with content, media, and categorization.
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href="/press-releases">
              <ArrowLeft className="h-4 w-4" />
              View Press Releases
            </Link>
          </Button>
        </div>

        <form
          className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
          onSubmit={handlePressReleaseSubmission}
          method="post"
        >
          <div className="my-3 md:my-5">
            <Label htmlFor="title">
              Title <span>*</span>
            </Label>
            <Input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Please enter press release title"
              required
            />
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div className="my-3 md:my-5">
              <Label htmlFor="publishedDate">
                Release Date <span>*</span>
              </Label>
              <Input
                type="date"
                id="publishedDate"
                name="publishedDate"
                value={formData.publishedDate}
                onChange={handleChange}
                required
              />
            </div>

            <div className="my-3 md:my-5">
              <Label htmlFor="lang">
                Language <span>*</span>
              </Label>
              <select
                id="lang"
                name="lang"
                value={formData.lang}
                onChange={handleChange}
                className="flex h-9 w-full rounded-md border border-input bg-white px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                required
              >
                <option value="English">English</option>
                <option value="Hindi">Hindi</option>
              </select>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div className="my-3 md:my-5">
              <Label htmlFor="thematicArea">
                Thematic Area <span>*</span>
              </Label>
              <Input
                type="text"
                id="thematicArea"
                name="thematicArea"
                value={formData.thematicArea}
                onChange={handleChange}
                placeholder="Health, Education, Livelihood"
                required
              />
            </div>

            <div className="my-3 md:my-5">
              <Label htmlFor="initiative">
                Initiative <span>*</span>
              </Label>
              <Input
                type="text"
                id="initiative"
                name="initiative"
                value={formData.initiative}
                onChange={handleChange}
                placeholder="Saheli, Josh, Pathanshala"
                required
              />
            </div>
          </div>

          <div className="my-3 md:my-5">
            <Label htmlFor="content">
              Content <span>*</span>
            </Label>
            <div className="mt-2">
              <JoditEditor
                ref={editor}
                value={formData.content}
                tabIndex={1}
                onBlur={handleContentChange}
                onChange={handleContentChange}
              />
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div className="my-3 md:my-5">
              <Label htmlFor="youtubeVideoId">YouTube Video ID or URL</Label>
              <Input
                type="text"
                id="youtubeVideoId"
                name="youtubeVideoId"
                value={formData.youtubeVideoId}
                onChange={handleChange}
                placeholder="https://youtube.com/watch?v=..."
              />
            </div>

            <div className="my-3 md:my-5">
              <Label htmlFor="images">Images</Label>
              <Input
                type="file"
                id="images"
                name="images"
                accept="image/*"
                multiple
                onChange={handleImagesChange}
              />
              <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                <ImagePlus className="h-3.5 w-3.5" />
                {images.length
                  ? `${images.length} image${images.length > 1 ? 's' : ''} selected`
                  : 'Upload up to 10 images'}
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <Button disabled={isSubmitting}>
              <Send className="h-4 w-4" />
              {isSubmitting ? 'Publishing...' : 'Publish Press Release'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Page;
