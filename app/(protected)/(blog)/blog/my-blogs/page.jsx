'use client';

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
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const Page = () => {
  const [blogs, setBlogs] = useState([]);

  async function getBlogs() {
    try {
      const res = await axios.get(`/get-my-blogs?isDeleted=false`);

      setBlogs(res.data.data.blogs);
    } catch (err) {
      console.log(err);
    }
  }

  useEffect(() => {
    getBlogs();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6">
          <p className="text-sm font-semibold uppercase tracking-wide text-rose-700">
            Blog Publishing
          </p>
          <h1 className="mt-2 text-3xl font-bold text-slate-950">
            Active Blogs
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Track your submitted blog posts and continue editing.
          </p>
        </div>
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead>S.No</TableHead>
                  <TableHead className="w-[400px]">Blog Title</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-center">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {blogs.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="py-8 text-center">
                      No active blogs found.
                    </TableCell>
                  </TableRow>
                )}

                {blogs.map((blog, index) => (
                  <TableRow key={blog._id}>
                    <TableCell className="font-medium">{index + 1}</TableCell>
                    <TableCell>{blog.title}</TableCell>
                    <TableCell>
                      {blog.isPublished ? 'Approved' : 'Not Approved'}
                    </TableCell>
                    <TableCell className="text-center">
                      <Button variant="link" className="text-blue-500">
                        <Link href={`/blog/${blog._id}`}>Edit</Link>
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
