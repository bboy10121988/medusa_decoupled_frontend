const { createClient } = require('@sanity/client');

const client = createClient({
    projectId: 'm7o2mv1n',
    dataset: 'production',
    apiVersion: '2024-01-01',
    useCdn: false
});

async function debug() {
    console.log('--- Debugging Sanity Data ---');

    // 1. Check all languages
    const queryAll = `*[_type == "post"]{title, language, _id}`;
    const allPosts = await client.fetch(queryAll);
    console.log(`Total posts: ${allPosts.length}`);
    console.log('Sample posts languages:');
    allPosts.forEach(p => console.log(`[${p.language}] ${p.title} (${p._id})`));

    // 2. Test zh-TW filter
    const qTW = `*[_type == "post" && language == $lang]{title, language}`;
    const twPosts = await client.fetch(qTW, { lang: 'zh-TW' });
    console.log(`\nFiltered zh-TW posts: ${twPosts.length}`);
    twPosts.forEach(p => console.log(`[${p.language}] ${p.title}`));

    // 3. Test en filter
    const qEN = `*[_type == "post" && language == $lang]{title, language}`;
    const enPosts = await client.fetch(qEN, { lang: 'en' });
    console.log(`\nFiltered en posts: ${enPosts.length}`);
    enPosts.forEach(p => console.log(`[${p.language}] ${p.title}`));
}

debug().catch(console.error);
