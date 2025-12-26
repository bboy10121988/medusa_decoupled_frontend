
const projectId = 'm7o2mv1n';
const dataset = 'production';
const query = encodeURIComponent('*[_type == "header"][0]{ favicon { "url": asset->url, alt } }');
const url = `https://${projectId}.api.sanity.io/v2021-10-21/data/query/${dataset}?query=${query}`;

console.log('Fetching from:', url);

fetch(url)
    .then(res => res.json())
    .then(data => {
        console.log('Data:', JSON.stringify(data, null, 2));
    })
    .catch(err => {
        console.error('Error:', err);
    });
