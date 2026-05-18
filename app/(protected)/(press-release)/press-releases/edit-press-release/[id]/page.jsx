'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import axios from '@/lib/axiosInstance';
import { getPressReleaseUrl } from '@/lib/pressReleaseApi';
import { ArrowLeft, ImagePlus, Save, Trash2 } from 'lucide-react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
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

const LANG_LABEL = {
  eng: 'English',
  en: 'English',
  English: 'English',
  hin: 'Hindi',
  hi: 'Hindi',
  Hindi: 'Hindi',
};

const extractYoutubeVideoId = (value) => {
  const trimmedValue = (value || '').trim();

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

const hasReadableContent = (value = '') =>
  value.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim().length > 0;

const buildPublishedDate = (pressRelease) => {
  if (!pressRelease) return '';
  const { day, month, year } = pressRelease;
  if (!day || !month || !year) return '';

  const monthIndex = MONTHS.findIndex(
    (m) => m.toLowerCase() === String(month).toLowerCase().slice(0, 3)
  );
  if (monthIndex === -1) return '';

  const mm = String(monthIndex + 1).padStart(2, '0');
  const dd = String(day).padStart(2, '0');
  return `${year}-${mm}-${dd}`;
};

const Page = () => {
  const router = useRouter();
  const params = useParams();
  const editor = useRef(null);
  const pressReleaseId = params?.id;

  const [isLoading, setIsLoading] = useState(true);
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
  const [existingImages, setExistingImages] = useState([]);
  const [removedImages, setRemovedImages] = useState([]);
  const [newImages, setNewImages] = useState([]);

  const visibleExistingImages = useMemo(
    () => existingImages.filter((img) => !removedImages.includes(img)),
    [existingImages, removedImages]
  );

  useEffect(() => {
    if (!pressReleaseId) return;

    const fetchPressRelease = async () => {
      try {
        setIsLoading(true);
        const res = await axios.get(
          getPressReleaseUrl(`/get-release-by-id/${pressReleaseId}`)
        );
        const pressRelease = res.data.data.pressRelease;

        setFormData({
          title: pressRelease.title || '',
          content: pressRelease.content || '',
          publishedDate: buildPublishedDate(pressRelease),
          lang: LANG_LABEL[pressRelease.lang] || pressRelease.lang || 'English',
          thematicArea: pressRelease.thematicArea || '',
          initiative: pressRelease.initiative || '',
          youtubeVideoId: pressRelease.youtubeVideoId || '',
        });
        setExistingImages(Array.isArray(pressRelease.images) ? pressRelease.images : []);
      } catch (err) {
        console.log(err);
        toast.error('Unable to load press release');
        router.push('/press-releases');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPressRelease();
  }, [pressReleaseId, router]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleContentChange = (value) => {
    setFormData((prev) => ({ ...prev, content: value }));
  };

  const handleNewImagesChange = (e) => {
    const selectedImages = Array.from(e.target.files || []).slice(0, 10);
    setNewImages(selectedImages);
  };

  const toggleRemoveExistingImage = (imageUrl) => {
    setRemovedImages((prev) =>
      prev.includes(imageUrl)
        ? prev.filter((url) => url !== imageUrl)
        : [...prev, imageUrl]
    );
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      toast.error('Please enter the title');
      return false;
    }

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
    payload.append(
      'youtubeVideoId',
      extractYoutubeVideoId(formData.youtubeVideoId)
    );

    if (removedImages.length) {
      payload.append('removedImages', JSON.stringify(removedImages));
    }

    newImages.forEach((image) => {
      payload.append('images', image);
    });

    return payload;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setIsSubmitting(true);

      await axios.patch(
        getPressReleaseUrl(`/update-release/${pressReleaseId}`),
        buildPressReleasePayload()
      );

      toast.success('Press release updated');
      router.push('/press-releases');
    } catch (err) {
      console.log(err);
      toast.error(
        err.response?.data?.message || 'Unable to update press release'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-8">
        <div className="mx-auto max-w-4xl text-center text-slate-600">
          Loading press release...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-rose-700">
              Media Coverage
            </p>
            <h1 className="mt-2 text-3xl font-bold text-slate-950">
              Edit Press Release
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              Update content, media, and categorization for this press release.
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href="/press-releases">
              <ArrowLeft className="h-4 w-4" />
              Back To Press Releases
            </Link>
          </Button>
        </div>

        <form
          className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
          onSubmit={handleSubmit}
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
              <Label htmlFor="images">Add New Images</Label>
              <Input
                type="file"
                id="images"
                name="images"
                accept="image/*"
                multiple
                onChange={handleNewImagesChange}
              />
              <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                <ImagePlus className="h-3.5 w-3.5" />
                {newImages.length
                  ? `${newImages.length} new image${newImages.length > 1 ? 's' : ''} selected`
                  : 'Upload up to 10 additional images'}
              </p>
            </div>
          </div>

          {existingImages.length > 0 && (
            <div className="my-3 md:my-5">
              <Label>Existing Images</Label>
              <p className="mt-1 text-xs text-slate-500">
                Click the trash icon to remove an image. Removed images will be
                deleted on save.
              </p>
              <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                {existingImages.map((imageUrl) => {
                  const isRemoved = removedImages.includes(imageUrl);
                  return (
                    <div
                      key={imageUrl}
                      className={`group relative overflow-hidden rounded-md border ${
                        isRemoved
                          ? 'border-rose-300 opacity-60'
                          : 'border-slate-200'
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={imageUrl}
                        alt="Press release"
                        className="h-32 w-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => toggleRemoveExistingImage(imageUrl)}
                        className={`absolute right-1.5 top-1.5 inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium shadow-sm ${
                          isRemoved
                            ? 'bg-slate-900 text-white hover:bg-slate-800'
                            : 'bg-white text-rose-700 hover:bg-rose-50'
                        }`}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        {isRemoved ? 'Undo' : 'Remove'}
                      </button>
                    </div>
                  );
                })}
              </div>
              <p className="mt-2 text-xs text-slate-500">
                {visibleExistingImages.length} image
                {visibleExistingImages.length === 1 ? '' : 's'} will remain after
                save
                {newImages.length
                  ? ` (+${newImages.length} new)`
                  : ''}
                .
              </p>
            </div>
          )}

          <div className="flex gap-3">
            <Button disabled={isSubmitting}>
              <Save className="h-4 w-4" />
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
            <Button asChild variant="outline" type="button">
              <Link href="/press-releases">Cancel</Link>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Page;
