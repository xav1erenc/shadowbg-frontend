"use client";
import {useState, useRef, useEffect} from "react";
import ProgressBar from "@badrap/bar-of-progress";
import {FaSearch, FaMagnet} from "react-icons/fa";

const progress = new ProgressBar({
  size: 2,
  color: "#204F73",
  className: "bar-of-progress",
  delay: 100,
});

function fetchResults(url, progress) {
  return new Promise((resolve, reject) => {
    var oReq = new XMLHttpRequest();
    oReq.open('GET', url);
    oReq.send();
    oReq.onreadystatechange = function() {
      if (oReq.readyState == XMLHttpRequest.DONE) {
        let data = JSON.parse(oReq.responseText);
        resolve(data);
      }
    }
  });
}

function readableFileSize(size) {
  var units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  var i = 0;
  while(size >= 1024) {
    size /= 1024;
    ++i;
  }
  return parseFloat(size).toFixed(2) + ' ' + units[i];
}

async function handleSearch(setSearchResult, text, offset, setOffset) {
  if(text === "") return;
  progress.start();
  const data = await fetchResults('/api/search?q='+encodeURIComponent(text)+(offset > 1 ? "&page="+offset : ""), progress);
  progress.finish();
  if (!data || data.error) {
    return;
  }
  setOffset(offset < 1 ? 1 : offset)
  setSearchResult(data.results)
}

export default function Home() {
  let [searchResult, setSearchResult] = useState();
  let [searchOffset, setSearchOffset] = useState(1);
  let searchTextBox = useRef(null);
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [searchResult])
  return (<>
    <div className="main mb-5">
      <div className="container">
        <div className="logo"></div>
        <div className="input-group mb-3">
          <input type="text" className="form-control" ref={searchTextBox} placeholder="Keywords to search" aria-label="Search" id="search-text" onKeyPress={(e) =>{ if(e.which == 13) { handleSearch(setSearchResult, searchTextBox.current.value, 1, setSearchOffset)}}}/>
          <button className="btn btn-secondary" onClick={() => handleSearch(setSearchResult, searchTextBox.current.value, 1, setSearchOffset)} type="button" id="search-button"><FaSearch/></button>
        </div>
        {
          searchResult ?
          (<>
          <ul className="list-group">
            {
              searchResult.map((item, key) => {
                return <li key={key} className="list-group-item search-item">
                    <a className="search-item-magnet" href={item.magnet}><FaMagnet/></a>
                    <span className="search-item-title">{item.title}</span>
                    <span className="search-item-size">{readableFileSize(item.size.String)}</span>
                    <span className="search-item-date">{item.dt}</span>
                  </li>
              })
            }
          </ul>
         </>) : ""
        }
        { searchResult && (searchResult.length >= 30 || searchOffset > 1) ? <ul className="pagination">
            <li className={`page-item ${searchOffset == 1 ? "disabled" : ""}`} onClick={(e) => { if(!e.target.classList.contains("disabled")) handleSearch(setSearchResult, searchTextBox.current.value, searchOffset-1, setSearchOffset)}}>
              <a className="page-link" aria-label="Previous">
                <span aria-hidden="true">Previous</span>
              </a>
            </li>
            <li className={`page-item ${searchResult.length < 30 && searchOffset > 1 ? "disabled" : ""}`} onClick={(e) => { if(!e.target.classList.contains("disabled")) handleSearch(setSearchResult, searchTextBox.current.value, searchOffset+1, setSearchOffset)}}>
              <a className="page-link" aria-label="Next">
                <span aria-hidden="true">Next</span>
              </a>
            </li>
          </ul>: "" }
      </div>
    </div>
  </>)
}
