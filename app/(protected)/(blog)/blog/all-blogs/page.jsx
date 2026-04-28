'use client';

import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useEffect, useState } from 'react';
import axios from '@/lib/axiosInstance';
import Link from 'next/link';
import toast from 'react-hot-toast';
const Page = () => {
  const [blogs, setBlogs] = useState([]);

  async function getBlogs() {
    try {
      const res = await axios.get(`/get-all-blogs?isDeleted=false`);

      setBlogs(res.data.data.blogs);
    } catch (err) {
      console.log(err);
    }
  }

  const deleteHandler = async (id) => {
    try {
      await axios.patch(`/${id}`, { isDeleted: true, isPublished: false });
      getBlogs();
      toast.success('Blog Deleted');
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    getBlogs();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6">
          <p className="text-sm font-semibold uppercase tracking-wide text-rose-700">
            Admin Review
          </p>
          <h1 className="mt-2 text-3xl font-bold text-slate-950">
            All Blogs
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Review, approve, edit, or remove submitted blog posts.
          </p>
        </div>
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead>S.No</TableHead>
                  <TableHead className="w-[400px]">Blog Title</TableHead>
                  <TableHead className="w-[400px]">Blog Author</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-center">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {blogs.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="py-8 text-center">
                      No blogs found.
                    </TableCell>
                  </TableRow>
                )}

                {blogs.map((blog, index) => (
                  <TableRow key={blog._id}>
                    <TableCell className="font-medium">{index + 1}</TableCell>
                    <TableCell>{blog.title}</TableCell>
                    <TableCell>{blog.author.fullName}</TableCell>
                    <TableCell>
                      {blog.isPublished ? 'Active' : 'Not Active'}
                    </TableCell>
                    <TableCell className="text-center">
                      <Button variant="link" className="text-blue-500">
                        <Link href={`/blog/${blog._id}`}>Edit</Link>
                      </Button>
                      <Button
                        variant="link"
                        onClick={() => deleteHandler(blog._id)}
                        className="text-red-500"
                      >
                        Delete
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
