const PRESS_RELEASE_SEGMENT = '/ladli/press-release';
const BLOG_SEGMENT = '/ladli/blog';

export const getPressReleaseUrl = (path = '') => {
  const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || '';
  const normalizedServerUrl = serverUrl.replace(/\/$/, '');
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  let baseUrl = normalizedServerUrl;

  if (baseUrl.includes(BLOG_SEGMENT)) {
    baseUrl = baseUrl.slice(0, baseUrl.lastIndexOf(BLOG_SEGMENT));
  } else if (baseUrl.includes(PRESS_RELEASE_SEGMENT)) {
    baseUrl = baseUrl.slice(
      0,
      baseUrl.lastIndexOf(PRESS_RELEASE_SEGMENT)
    );
  }

  return `${baseUrl}${PRESS_RELEASE_SEGMENT}${normalizedPath}`;
};
