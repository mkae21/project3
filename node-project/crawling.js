const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const mongoose = require('mongoose');
const mongodb = require('./mongoose/index');
const Jobs = require('./mongoose/schemas/Job'); // 채용 공고 정보 모델

const app = express();
const PORT = 443;

/**
 * 공통: 대기 함수
 * @param {number} ms - 대기할 시간(ms)
 * @returns {Promise} - Promise 객체
 */
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * 공통: HTML 페이지 가져오기
 * @param {string} url - 요청할 URL
 * @param {number} maxRetries - 최대 재시도 횟수
 * @param {object} headers - 요청 헤더
 * @returns {Promise<object>} - cheerio 객체와 HTML 데이터
 */
const fetchPage = async (url, maxRetries = 3, headers = {}) => {
    const defaultHeaders = {
        'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    };

    let attempt = 0;
    while (attempt < maxRetries) {
        try {
            const response = await axios.get(url, { headers: { ...defaultHeaders, ...headers } });
            const $ = cheerio.load(response.data);
            return { $, html: response.data };
        } catch (error) {
            attempt++;
            console.error(`URL 요청 실패 (시도 ${attempt}/${maxRetries}):`, error.message);
            if (attempt >= maxRetries) throw new Error(`URL 요청 실패: ${url}`);
        }
    }
};

/**
 * 공통: 데이터 업데이트/삽입 함수
 * @param {object} model - Mongoose 모델
 * @param {Array} data - 업데이트할 데이터 배열
 * @param {string} uniqueKey - 고유 식별자로 사용할 필드 이름
 */
const bulkUpdate = async (model, data, uniqueKey) => {
    const bulkOperations = data.map((item) => ({
        updateOne: {
            filter: { [uniqueKey]: item[uniqueKey] }, // 고유 식별자 필드
            update: { $set: item },                  // 데이터 업데이트
            upsert: true,                            // 없으면 새로 생성
        },
    }));

    if (bulkOperations.length > 0) {
        try {
            const result = await model.bulkWrite(bulkOperations);
            console.log(`${model.collection.name} 업데이트 완료`);
            console.log(`업데이트: ${result.nModified}, 삽입: ${result.upsertedCount}`);
        } catch (error) {
            console.error(`${model.collection.name} 업데이트 실패:`, error.message);
        }
    } else {
        console.log(`${model.collection.name}에 업데이트할 데이터가 없습니다.`);
    }
};

/**
 * 채용 공고 크롤링 함수
 * @param {string} keyword - 검색할 키워드
 * @param {number} pages - 크롤링할 페이지 수
 * @param {number} maxRetries - 최대 재시도 횟수
 * @param {number} interval - 페이지 간 대기 시간(ms)
 * @returns {Promise<Array>} 채용공고 정보 배열
 */

const crawlRecruitInfo = async (keyword, pages = 3, maxRetries = 3, interval = 2000) => {
    const jobs = [];

    for (let page = 1; page <= pages; page++) {
        const url = `https://www.saramin.co.kr/zf_user/search/recruit?searchType=search&searchword=${encodeURIComponent(
            keyword
        )}&recruitPage=${page}`;
        console.log(`페이지 ${page} 크롤링 시작...`);
        const { $ } = await fetchPage(url, maxRetries);

        // 채용공고 목록 파싱
        $('.item_recruit').each((index, element) => {
            try {
                const company = $(element).find('.corp_name a').text().trim();
                const title = $(element).find('.job_tit a').text().trim();
                const link =
                    'https://www.saramin.co.kr' +
                    $(element).find('.job_tit a').attr('href');
                const conditions = $(element).find('.job_condition span');
                const location = $(conditions[0]).text().trim() || '';
                const experience = $(conditions[1]).text().trim() || '';
                const education = $(conditions[2]).text().trim() || '';
                const employmentType = $(conditions[3]).text().trim() || '';
                const deadline = $(element)
                    .find('.job_date .date')
                    .text()
                    .trim();
                const jobSector = $(element).find('.job_sector').text().trim() || '';
                const salaryBadge = $(element)
                    .find('.area_badge .badge')
                    .text()
                    .trim();
                const salary = salaryBadge || '';

                jobs.push({
                    회사명: company,
                    제목: title,
                    링크: link,
                    지역: location,
                    경력: experience,
                    학력: education,
                    고용형태: employmentType,
                    마감일: deadline,
                    직무분야: jobSector,
                    연봉정보: salary,
                    조회수: 0
                });
            } catch (error) {
                console.error('항목 파싱 중 에러 발생:', error.message);
            }
        });

        console.log(`${page} 페이지 크롤링 완료`);
        if (page < pages) {
            console.log(`다음 페이지 크롤링 전 ${interval}ms 대기 중...`);
            await delay(interval);
        }
    }

    return jobs;
};


// /**
//  * 기업 정보 크롤링 함수
//  * @param {string} keyword - 검색할 키워드
//  * @param {number} pages - 크롤링할 페이지 수
//  * @param {number} maxRetries - 최대 재시도 횟수
//  * @param {number} interval - 페이지 간 대기 시간(ms)
//  * @returns {Promise<Array>} 회사 정보 배열
//  */
// const crawlCompanyInfo = async (keyword, pages = 3, maxRetries = 3, interval = 2000) => {
//     console.log("기업 정보 크롤링 시작");
//     const companies = []; // 데이터 저장 배열

//     for (let page = 1; page <= pages; page++) {
//         try {
//             const url = `https://www.saramin.co.kr/zf_user/search/company?searchword=${encodeURIComponent(
//                 keyword
//             )}&page=${page}&searchType=recently&pageCount=10&mainSearch=n`;

//             console.log(`페이지 ${page} 크롤링 시작...`);
//             const { $ } = await fetchPage(url, maxRetries);

//             $('.item_corp').each((index, element) => {
//                 try {
//                     const companyName = $(element).find('.corp_name').text().trim() || ''; // 클래스 선택자 수정
//                     const establishmentDate = $(element).find('dd').eq(0).text().trim() || '';
//                     const ceoName = $(element).find('dd').eq(1).text().trim() || '';
//                     const industry = $(element).find('dd').eq(2).text().trim() || '';
//                     const financialInfo = $(element).find('dd').eq(3).text().trim() || '';
//                     const companyAddress = $(element).find('dd').eq(4).text().trim() || '';

//                     companies.push({
//                         회사명: companyName,
//                         설립일: establishmentDate,
//                         설립자: ceoName,
//                         업종: industry,
//                         재정정보: financialInfo,
//                         회사주소: companyAddress,
//                     });
//                 } catch (error) {
//                     console.error('항목 파싱 중 에러 발생:', error.message);
//                 }
//             });

//             console.log(`페이지 ${page} 크롤링 완료`);
//             if (page < pages) {
//                 console.log(`다음 페이지 요청 전 ${interval}ms 대기 중...`);
//                 await delay(interval); // 대기
//             }
//         } catch (error) {
//             console.error(`페이지 ${page} 크롤링 실패:`, error.message);
//         }
//     }

//     console.log('크롤링된 회사 데이터:', companies);
//     return companies;
// };


/**
 * 서버 시작 함수
 */
const startServer = async () => {
    try {
        await mongodb.connect();
        console.log('DB 연결 성공');
        console.log('MongoDB 상태:', mongoose.connection.readyState); // 1이면 연결 성공

        const keyword = '개발';
        const pages = 3;
        const interval = 3000; // 3초 대기

        // 채용 공고 크롤링 및 업데이트

        const jobs = await crawlRecruitInfo(keyword, pages, 3, interval);
        // const companies = await crawlCompanyInfo(keyword,pages,3,interval);

        // 중복 데이터 방지 및 업데이트

        await bulkUpdate(Jobs, jobs, '링크'); // '링크'를 고유 식별자로 사용하여 중복 방지
        // await bulkUpdate(Companys,companies,'회사주소')

        console.log('취업 정보 저장 완료');
    } catch (error) {
        console.error('서버 시작 실패:', error.message);
    }
};

// 서버 실행
startServer();

app.listen(PORT, () => {
    console.log(`Server is running on localhost:${PORT}`);
});
