const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const app = express();
const mongoose = require('mongoose')
const mongodb = require('./mongoose/index')
const Jobs = require('./mongoose/schemas/Job') //db 모델

const PORT = 443;


/**
 * 사람인 채용공고를 크롤링하는 함수
 * @param {string} keyword - 검색할 키워드
 * @param {number} pages - 크롤링할 페이지 수
 * @returns {Promise<Array>} 채용공고 정보가 담긴 배열
 */

const crawlSaramin = async (keyword, pages = 1) => {
    const jobs = []; //저장할 배열
    const headers = {
        'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    };

    for (let page = 1; page <= pages; page++) {
        const url = `https://www.saramin.co.kr/zf_user/search/recruit?searchType=search&searchword=${encodeURIComponent(
            keyword
        )}&recruitPage=${page}`;

        try {
            const response = await axios.get(url, { headers });
            const $ = cheerio.load(response.data);

            // 채용공고 목록 가져오기
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
                    });
                } catch (error) {
                    console.error('항목 파싱 중 에러 발생:', error.message);
                }
            });

            console.log(`${page}페이지 크롤링 완료`);
        } catch (error) {
            console.error('페이지 요청 중 에러 발생:', error.message);
        }
    }

    return jobs;
};

// 라우트 설정
// app.get('/saramin', async (req, res) => {
//     const keyword = req.query.keyword || 'express';
//     const pages = parseInt(req.query.pages) || 1;

//     try {
//         const jobs = await crawlSaramin(keyword, pages);

//         for(const job of jobs){
//             const newJob = new Jobs(job)
//             await newJob.save()
//         }
//         res.json(jobs);

//         // 결과를 CSV 파일로 저장 (옵션)
//         const csvContent =
//             '회사명,제목,링크,지역,경력,학력,고용형태,마감일,직무분야,연봉정보\n' +
//             jobs
//                 .map((job) =>
//                     Object.values(job)
//                         .map((value) => `"${value.replace(/"/g, '""')}"`)
//                         .join(',')
//                 )
//                 .join('\n');
//         fs.writeFileSync('saramin_jobs.csv', csvContent);
//     } catch (error) {
//         console.error('크롤링 중 에러 발생:', error.message);
//         res.status(500).json({ error: '크롤링 중 문제가 발생했습니다.' });
//     }
// });


const startServer = async () => {
    try {

        await mongodb.connect()
        console.log("db 연결 성공")
        console.log("MongoDB 상태:", mongoose.connection.readyState); // 1이면 연결 성공

        const collections = await mongoose.connection.db.listCollections().toArray();
        const collectionNames = collections.map((col) => col.name);

        const keyword = 'python';
        const pages = 1;
        const jobs = await crawlSaramin(keyword, pages);

        //최초 db 저장시
        if (!collectionNames.includes('jobs')) {
            console.log('Job 컬렉션이 존재하지 않음, 생성 중...');
            await Jobs.createCollection();
            await Jobs.insertMany(jobs);
            console.log('데이터 저장 완료');

        }else{
            console.log('Job 컬렉션이 이미 존재');
            //중복 데이터 처리
            const bulkOperations = jobs.map((job) => ({
                updateOne: {
                    filter: { 링크: job.링크 }, // 고유 식별자
                    update: { $set: job },      // 데이터 업데이트
                    upsert: true,               // 없으면 새로 생성
                },
            }));

            await Jobs.bulkWrite(bulkOperations);
            console.log('중복 데이터 확인 및 처리 완료');
        }
    } catch (error) {
        console.error('서버 시작 실패', error.message);
    }
};

startServer();

app.listen(PORT, () => {
    console.log(`Server is running on http://113.198.66.75:${PORT}`);
});
