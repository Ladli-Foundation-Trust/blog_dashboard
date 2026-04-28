'use client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import JoditEditor from 'jodit-react';
import { useEffect, useRef, useState } from 'react';
import axios from '@/lib/axiosInstance';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useAuth } from '@/context/AuthContext';

const Page = ({ params }) => {
  const router = useRouter();
  const editor = useRef(null);
  const { user } = useAuth();

  const [isLoading, setIsLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [blogImage, setBlogImage] = useState('');
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDesc, setMetaDesc] = useState('');
  const [metaKeywords, setMetaKeywords] = useState('');

  const [previewImage, setPreviewImage] = useState('');

  const handleBlogSubmission = async (e) => {
    try {
      e.preventDefault();
      setIsLoading(true);

      await axios.patch(`/${params.blog}`, { title, content });

      toast.success('Blog Updated !!!');

      setIsLoading(false);
      setTimeout(() => {
        router.push('/blog/my-blogs');
      }, 300);
    } catch (err) {
      setIsLoading(false);

      console.log(err);
    }
  };

  const updateImageHandler = async (e) => {
    try {
      const formData = new FormData();

      formData.append('blogImage', blogImage);
      const res = await axios.patch(`/update-image/${params.blog}`, formData);

      console.log(res);
    } catch (err) {
      console.log(err);
    }
  };

  const approveBlog = async () => {
    try {
      await axios.patch(`/${params.blog}`, { isPublished: true });
    } catch (err) {
      console.log(err);
    }
  };

  async function getBlog() {
    try {
      const res = await axios.get(`/${params.blog}`);

      setTitle(res.data.data.blog.title);
      setContent(res.data.data.blog.content);
      setMetaTitle(res.data.data.blog.metaTitle);
      setMetaDesc(res.data.data.blog.metaDesc);
      setMetaKeywords(res.data.data.blog.metaKeyword);
      setPreviewImage(res.data.data.blog.images);
    } catch (err) {
      console.log(err);
    }
  }

  useEffect(() => {
    getBlog();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6">
          <p className="text-sm font-semibold uppercase tracking-wide text-rose-700">
            Blog Publishing
          </p>
          <h1 className="mt-2 text-3xl font-bold text-slate-950">
            Edit Blog
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Update the story content, metadata, approval status, or image.
          </p>
        </div>
        <form
          className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
          onSubmit={handleBlogSubmission}
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
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Please Enter Blog Title"
              required
            />
          </div>

          <div className="my-3 md:my-5">
            <Label htmlFor="content">
              Blog Content <span>*</span>
            </Label>
            <JoditEditor
              ref={editor}
              tabIndex={1}
              value={content}
              onBlur={(e) => setContent(e)}
            />
          </div>

          <div className="my-3 md:my-5">
            <Label htmlFor="meta-title">
              Meta Title <span>*</span>
            </Label>
            <Input
              type="text"
              id="meta-title"
              name="meta-title"
              placeholder="Please Enter Meta Title"
              value={metaTitle}
              onChange={(e) => setMetaTitle(e.target.value)}
              required
            />
          </div>

          <div className="my-3 md:my-5">
            <Label htmlFor="meta-description">
              Meta Description <span>*</span>
            </Label>
            <Input
              type="text"
              id="meta-description"
              name="meta-description"
              placeholder="Please Enter Meta Description"
              value={metaDesc}
              onChange={(e) => setMetaDesc(e.target.value)}
              required
            />
          </div>

          <div className="my-3 md:my-5">
            <Label htmlFor="meta-description">
              Meta Keywords <span>*</span>
            </Label>
            <Input
              type="text"
              id="meta-description"
              name="meta-description"
              placeholder="Please Enter Meta Description"
              value={metaKeywords}
              onChange={(e) => setMetaKeywords(e.target.value)}
              required
            />
          </div>

          <div className="flex gap-3">
            <Button disabled={isLoading}>
              {isLoading ? 'Loading...' : 'Edit Blog'}
            </Button>

            {user.role === 'admin' && (
              <Button
                type="button"
                className="bg-green-700"
                onClick={() => {
                  approveBlog();
                }}
              >
                Approve
              </Button>
            )}
          </div>
        </form>

        <div className="mt-8 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-slate-950">
            Blog Image
          </h2>
          <div className="overflow-hidden rounded-md border border-slate-200 bg-slate-50">
            <Image src={previewImage} alt="" width={300} height={100} />
          </div>

          <div className="my-3 md:my-5">
            <Dialog>
              <DialogTrigger asChild>
                <Button>Change Image</Button>
              </DialogTrigger>
              <DialogContent>
                <form method="post" onSubmit={updateImageHandler}>
                  <div className="my-3">
                    <Label htmlFor="blog-image">Upload Image</Label>
                    <Input
                      type="file"
                      id="blog-image"
                      name="blog-image"
                      onChange={(e) => setBlogImage(e.target.files[0])}
                      placeholder="Please Enter Blog Title"
                      required
                    />
                  </div>
                  <Button type="submit">Update Image</Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
