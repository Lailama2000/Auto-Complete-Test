import { CircularProgress, Container, Typography } from '@mui/material';
import axios from 'axios';
import React, { useEffect, useState, useCallback, useRef } from 'react';
import Loading from './Loading'
import useSWR from 'swr';

const fetcher = url => axios.get(url).then(res => res.data);

export default function InputField() {
    const [bookData, setBookData] = useState([]); 
    const [search, setSearch] = useState(''); 
    const [filtered, setFiltered] = useState([]);
    const [displayed, setDisplayed] = useState([]); 
    const [page, setPage] = useState(1); 
    const [isFetching, setIsFetching] = useState(false); 
    const [more, setMore] = useState(true); 
    const [open ,setOpen] = useState(true)
    const containerRef = useRef(null);
    const [selected, setSelected] = useState(''); 
    const { data } = useSWR('https://softwium.com/api/books', fetcher);
   
    useEffect(() => {
        if (data) {
            setOpen(false)
            setBookData(data)
            setDisplayed(data.slice(0, 10)); 
        }
    }, [data]);

    const loadMoreData = useCallback(() => {
        if (isFetching || !more) return;

        setIsFetching(true);

        setTimeout(() => {
            const nextPage = page + 1;
            const moreItems = (search ? filtered : bookData).slice((nextPage - 1) * 10, nextPage * 10); 

            if (moreItems.length > 0) {
                setDisplayed(prev => [...prev, ...moreItems]);
                setPage(nextPage);
            } else {
                setMore(false);
            }

            setIsFetching(false);
        }, 1000);
    }, [isFetching, more, page, bookData, filtered, search]);

    const handleSearchChange = (e) => {
        const query = e.target.value.toLowerCase();
        setSearch(query);
        setPage(1); 

        if (query.length > 0) {
            const filtered = bookData.filter(book =>
                book.title.toLowerCase().includes(query) ||
                book.id.toString() === query
            );
            setFiltered(filtered);
            setDisplayed(filtered.slice(0, 10)); 
            setMore(filtered.length > 10); 
        } else {
            setFiltered([]);
            setDisplayed(bookData.slice(0, 10)); 
            setMore(bookData.length > 10);
        }
    };
    function highlight(text, highlight) {
        if (!highlight) return text;
        const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
        return (
            <>
                {parts.map((part, index) =>
                    part.toLowerCase() === highlight.toLowerCase() ? (
                        <span key={index} style={{ color: 'black', fontWeight: 'bold', fontSize:'13px' }}>
                            {part}
                        </span>
                    ) : (
                        part
                    )
                )}
            </>
        );
    }
    
    const handleScroll = () => {
        if (containerRef.current) {
            const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
            if (scrollTop + clientHeight >= scrollHeight - 5) {
                loadMoreData();
            }
        }
    };

    return (
        <div>
            {open && <Loading open={open} />}
            <Container maxWidth='sm' sx={{display:'flex',flexWrap:'wrap',justifyContent:'center',alignItems:'center',gap:'20px'}}>
                <Typography sx={{color:'#7b1fa2',fontWeight:'bolder',fontSize:'30px'}}>Search Component</Typography>
            <input
                placeholder='Search for a book by title or book id'
                onChange={handleSearchChange}
                value={search}
                className='input'
            />
            {displayed.length > 0 && (
                    <ul 
                        onScroll={handleScroll}
                        ref={containerRef}
                        style={{ listStyleType: 'none', padding: 0 }}
                    >
                        {displayed.map((book, index) => (
                            <li
                                style={{backgroundColor:selected===index ? '#d1c4e9' : ''}}
                                key={index}
                                onClick={() => {setSelected(index);
                                console.log('Selected Book :',book)}}
                            >
                             {highlight(book.title, search)} - {book.authors.join(' and ')}
                            </li>
                        ))}
                        {isFetching && (
                            <li style={{ display: 'flex', justifyContent: 'center', padding: '10px', border:'none' }}>
                                <CircularProgress color="secondary" />
                            </li>
                        )}
                    </ul>
                )}
            </Container>
        </div>
    )
}
