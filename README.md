# 프로젝트 SPEC

![](https://img.shields.io/badge/node-v18.18.0-ffffff?style=flat&logo=Node.js)
![](https://img.shields.io/badge/Vite-646CFF?style=flat&logo=Vite&logoColor=ffffff)
![](https://img.shields.io/badge/Element+-409eff?style=flat&logo=)
![](https://img.shields.io/badge/Vue--draggable-0CF6F4?style=flat&logo=)
![](https://img.shields.io/badge/io--ts-f5f6fa?style=flat&logo=)
![](https://img.shields.io/badge/ESLint-4B32C3?style=flat&logo=ESLint)
![](https://img.shields.io/badge/stylelint-263238?style=flat&logo=stylelint)
![](https://img.shields.io/badge/kakao.maps-FFCD00?style=flat&logo=Kakao&logoColor=ffffff)
![](https://img.shields.io/badge/TOAST--UI/editor-515ce6?style=flat&logo=&logoColor=ffffff)

**특이사항**

- 프로젝트 생성 당시 빠른 처리 속도를 위해 [Element+](https://element-plus.org/en-US/) 라이브러리를 사용
    - ⚠️ Element+ UI 버그로 `element-plus@2.4.4` 고정
- CSS 작업을 최소화하기 위해 `App.vue`에 Global CSS를 생성하여 전역에서 사용
  <br/>

# 프로젝트 실행방법

### 1. Localhost Domain 추가(MAC Ver)

> 해당 프로젝트를 로컬에서 정상적으로 실행하기 위해선 localhost 추가가 필요함.

1-1. 터미널 실행 - `sudo vim /private/etc/hosts` 입력 <br/>
1-2. 아래의 내용 추가

```
127.0.0.1    local.torder.co.kr  // 내사 어드민
127.0.0.1    local.torder.com    // 해외 어드민
127.0.0.1    local.uplusorder.com    // UPLUS 어드민
127.0.0.1    local-storeadmin.torder.co.kr  // 소상공인 어드민
127.0.0.1    local.partners.admin.torder.co.kr  // 북미 파트너스 어드민
```

1-3. `origin:serve:dev`하여 실행 시 아래와 같이 적용 확인 <br/>
![](https://user-images.githubusercontent.com/91718091/216925079-24ded263-4e22-4ebd-afbe-08778649007d.png)<br/>
1-4. node version 20버전 이상 사용 권장

### 2. scripts 실행 명령어

```json
{
  "scripts": {
    "tsc-lint": "vue-tsc --noEmit",
    "preview": "vite preview --host local.torder.co.kr --port 8080",
    "start": "node .cli/index.js",
    "test_a:serve:local": "env-cmd --verbose -e test-a -r .cmdrc-local.json vite --host local.torder.co.kr",
    "test_b:serve:local": "env-cmd --verbose -e test-b -r .cmdrc-local.json vite --host local.torder.co.kr",
    "test_c:serve:local": "env-cmd --verbose -e test-c -r .cmdrc-local.json vite --host local.torder.co.kr",
    "test_d:serve:local": "env-cmd --verbose -e test-d -r .cmdrc-local.json vite --host local.torder.co.kr",
    "test_e:serve:local": "env-cmd --verbose -e test-e -r .cmdrc-local.json vite --host local.torder.co.kr",
    "test_f:serve:local": "env-cmd --verbose -e test-f -r .cmdrc-local.json vite --host local.torder.co.kr",
    "origin:serve:dev": "env-cmd --verbose -e origin -r .cmdrc-development.json vite --host local.torder.co.kr",
    "origin:serve:staging": "env-cmd --verbose -e origin -r .cmdrc-staging.json vite --host local.torder.co.kr",
    "origin:serve:live": "env-cmd --verbose -e origin -r .cmdrc-production.json vite --host local.torder.co.kr",
    "origin:build:dev": "env-cmd --verbose -e origin -r .cmdrc-development.json vite build",
    "origin:build:staging": "env-cmd --verbose -e origin -r .cmdrc-staging.json vite build",
    "origin:build:live": "env-cmd --verbose -e origin -r .cmdrc-production.json vite build",
    "uplus:serve:dev": "env-cmd --verbose -e uplus -r .cmdrc-development.json vite --host local.uplusorder.com",
    "uplus:serve:staging": "env-cmd --verbose -e uplus -r .cmdrc-staging.json vite --host local.uplusorder.com",
    "uplus:serve:live": "env-cmd --verbose -e uplus -r .cmdrc-production.json vite --host local.uplusorder.com",
    "uplus:build:dev": "env-cmd --verbose -e uplus -r .cmdrc-development.json vite build",
    "uplus:build:staging": "env-cmd --verbose -e uplus -r .cmdrc-staging.json vite build",
    "uplus:build:live": "env-cmd --verbose -e uplus -r .cmdrc-production.json vite build",
    "brand1:serve:dev": "env-cmd --verbose -e brand1 -r .cmdrc-development.json vite --host local-storeadmin.torder.co.kr",
    "brand1:serve:staging": "env-cmd --verbose -e brand1 -r .cmdrc-staging.json vite --host local-storeadmin.torder.co.kr",
    "brand1:serve:live": "env-cmd --verbose -e brand1 -r .cmdrc-production.json vite --host local-storeadmin.torder.co.kr",
    "brand1:build:dev": "env-cmd --verbose -e brand1 -r .cmdrc-development.json vite build",
    "brand1:build:staging": "env-cmd --verbose -e brand1 -r .cmdrc-staging.json vite build",
    "brand1:build:live": "env-cmd --verbose -e brand1 -r .cmdrc-production.json vite build",
    "global:serve:dev": "env-cmd --verbose -e global -r .cmdrc-development.json vite --host local.torder.com",
    "global:build:dev": "env-cmd --verbose -e global -r .cmdrc-development.json vite build",
    "us_east:serve:live": "env-cmd --verbose -e us-east -r .cmdrc-production.json vite --host local.torder.com",
    "us_east:build:live": "env-cmd --verbose -e us_east -r .cmdrc-production.json vite build",
    "sg:serve:live": "env-cmd --verbose -e sg -r .cmdrc-production.json vite --host local.torder.com",
    "sg:build:live": "env-cmd --verbose -e sg -r .cmdrc-production.json vite build",
    "sydney:serve:live": "env-cmd --verbose -e sydney -r .cmdrc-production.json vite --host local.torder.com",
    "sydney:build:live": "env-cmd --verbose -e sydney -r .cmdrc-production.json vite build",
    "partners:serve:live": "env-cmd --verbose -e partners -r .cmdrc-production.json vite --host local.torder.com",
    "partners:build:live": "env-cmd --verbose -e partners -r .cmdrc-production.json vite build",
    "lint": "eslint --ext .js,.ts,.vue --ignore-path .gitignore --fix src",
    "prettier": "npx prettier 'src/**/*.{js,ts,vue}' --write",
    "stylelint": "stylelint '**/*.vue' --fix",
    "deploy:action": "node ./script/deploy.action.mjs",
    "test": "vitest"
  }
}
```

- ⚠️ 로컬 https 적용 전까지 `VITE_ADMIN_API_URL` ***http*** 로 수정 필요
    - `uplus:serve:dev`
    - `brand1:serve:dev`
    - `partners:serve:live`

### 3. 어드민별 URL

- 내사 어드민 (LIVE): https://admin.cs.torder.co.kr, https://kr.admin.torder.com
- 내사 어드민 (STAGE): http://stage.cs.torder.co.kr
- 내사 어드민 (DEV) : http://dev.cs.torder.co.kr


- 소상공인 어드민(DEV): http://dev-storeadmin.torder.co.kr


- ~~해외 DEV 어드민 (US-EAST 기준) : http://dev-global-admin.torder.com/~~
- SG 어드민 : https://sg-admin.torder.com
- US-EAST 어드민 : https://us-east-admin.torder.com, https://us1.admin.torder.com
- SYDNEY 어드민 : https://sydney-admin.torder.com


- TOPAZ: 북미 파트너스 어드민 (LIVE): https://us1.topaz.torder.com


- U+오더 어드민 (LIVE): https://admin.cs.uplusorder.com/
- U+오더 어드민 (STAGE) : https://stage-admin.cs.uplusorder.com/
- U+오더 어드민 (DEV) : https://dev-admin.cs.uplusorder.com/
  <br/>

# 프로젝트 커밋 컨벤션

- feat : 새로운 기능 추가
- edit : 코드 수정
- fix : 버그 수정
- test : 테스트 코드 추가 및 수정, 리펙토링 테스트 코드 추가
- chore : 개발 외 작업 (문서 및 주석 작성)

# 프로젝트 디렉토리 구조

> src <br/>
> ⎣&nbsp;**api** - rest api 및 주소 <br/>
> ⎣&nbsp;**assets** - image 파일 <br/>
> ⎣&nbsp;**codecs** - 런타임 타입 체커 <br/>
> ⎣&nbsp;**common** - 공통으로 사용할 파일 <br/>
> ⎣&nbsp;**components** - 자신의 state가 없고, props와 CSS만 존재하는 최소단위 컴포넌트<br/>
> ⎣&nbsp;**composables** - Vue Mixins을 대체할 공용으로 쓰일 상태값을 정리 해둔 이펙터<br/>
> ⎣&nbsp;**containers** - 컨트롤 로직이 존재하는 뷰 컴포넌트. 상태값이 없는 다수의 뷰 컴포넌트와 조합하여 사용한다.<br/>
> ⎣&nbsp;**interface** - Typescript 객체에 대한 타입 지정을 모아두고 있다.<br/>
> ⎣&nbsp;**layouts** - 상단에 고정되어 페이지 이동이 되어도 렌더링 되지 않는 영역<br/>
> ⎣&nbsp;**router** - vue router 정보<br/>
> ⎣&nbsp;**store** - vuex 관련 파일<br/>
> ⎣&nbsp;**styles** - css 모음<br/>
> ⎣&nbsp;**utils** - vue 컴포넌트 helper util<br/>
> ⎣&nbsp;**views** - 페이지 단위의 vue 컴포넌트<br/>

<br/>

# Git branch 전략

> feature -> develop -> main

## 1. Feature Branch Workflow

- 브랜치 생성 규칙: `feature/{jira-key}`
- PR의 타이틀 규칙: `Feature/(지라 이슈 키) 작업 타이틀`
    ```
    eg. Feature/T1PM-6574 내사어드민 사업체 구분 기능 추가
    ```

## 2. CI/CD Role

- github labels를 사용하여 선택적으로 CI/CD를 실행할 수 있다.

> #### 개별 브랜치 -> pull request -> develop 의 경우

|        라벨         |    실행 파일    |       결과       |
|:-----------------:|:-----------:|:--------------:|
|     `origin`      | develop.yml |   현행 dev망 배포   |
| `origin`, `stage` | develop.yml |  현행 stage망 배포  |
|     `global`      | develop.yml | Global dev망 배포 |
|      `uplus`      | develop.yml |  U+오더 dev망 배포  |
| `uplus`, `stage`  | develop.yml | U+오더 stage망 배포 |

> #### develop -> pull request -> main 의 경우

|         라벨          |  실행 파일   |                     결과                     |
|:-------------------:|:--------:|:------------------------------------------:|
|  `origin`, `live`   | main.yml |                 현행 운영망 배포                  |
|   `uplus`, `live`   | main.yml |                U+오더 운영망 배포                 |
|  `global`, `live`   | main.yml | 모든 해외망(us-east,us,singapore,sydney) 운영망 배포 |
|  `us-east`, `live`  | main.yml |            캐나다(us-east) 운영망 배포             |
| `singapore`, `live` | main.yml |                싱가포르 운영망 배포                 |
|  `sydney`, `live`   | main.yml |               sydney 운영망 배포                |

<br/>

# 개발 및 운영 참고사항

### 1. PAGE 접근 권한 & LNB 설정

- LNB, Page, 기능(Function) 기준으로 개별 코드를 부여함
- **_어드민 > LNB 권한 관리 페이지_** (1004 계정만 접근 가능) 에서 권한 별 접근 설정
- 신규 페이지 추가 시 작업 단계

```
1. 페이지 생성
2. router 등록 (`router/index.ts`)
3. lnb, 접근 페이지 정보 등록 (`store/storeAuth.ts`);
   3-1. lnb에 추가해야할 페이지일 경우 `originLnbTree` 에 추가
   3-2. 추가한 lnb에 대한 정보 데이터 `originLnbData` 에 추가 (path, query, icon)
   3-3. 페이지에 대한 접근 권한을 추가해야할 경우 `totalPageList` 에 추가
4. 권한설정페이지(`authManage`)에서 원하는 권한 번호에 해당 페이지에 대한 권한을 부여
```

추가 설명은 [노션 링크](https://www.notion.so/torderkorea/02-06-72075a07981f4aec91c3094ef2b144b4?pvs=4) 참고

### 2. 어드민 매장 추가 및 계정 생성 Flow

- 매장 생성: **_LNB 매장스트 - [신규 매장 생성] 팝업_** 으로 신규 매장 등록
- 최초 생성 시 `태블릿 로그인 아이디` === `매장 ID`(마스터, 점주 어드민/사장님 앱 로그인 아이디)
    - `태블릿 로그인 아이디` 수정: [매장 설정] 페이지
    - `매장 ID` 수정: **_회원 관리 > 비즈니스 회원 관리 > 상세 팝업_**

### 3. 매장 설정 페이지 특이사항 (src/views/StoreManage.vue)

- `/api/store/info?storeCode={매장코드}` 응답 중, 필드가 오지 않는 경우(undefined) 해당 기능 미출력.
    - eg. api 응답값에 `no_goods_notify_use` 가 없으면 `등록된 상품이 없을 때 안내문구 노출 사용 여부` 기능 미출력
- 기능 추가 시 `v-if="isUndefinedData(..)"` 필수 반영
- 국내/해외/U+/소상공인 등 도메인 별 기능 출력 여부는 api 응답값에 의존함

### 4. 옵션 구조

- 티오더1, 티오더2의 옵션 구조가 달라 api를 다르게 사용함.
- 워딩이 몇 차례 변경됨. 최종 사용 용어는 `옵션 그룹`, `옵션 상품` 뿐
    - `옵션 그룹` = 그룹
    - `옵션 상품` = 옵션 아이템 = 옵션 그룹 아이템

### 5. 점주어드민 이용약관 관리 - 마이페이지 실험실 기능

> 12 | [데모][dev] 티오더 약관 관리

- 동의 유무: 필수 동의가 필요한지의 유무
- 팝업 사용: 점주어드민에서 약관 노출 여부
  <br/>

# 전역 CSS 스타일

자주 사용하는 css 속성을 src/App.vue 파일에 선언하여 전역적으로 사용함.
다음과 같이 사용한다.

```html

<div class="mb-10 font-small">
    예시 코드
</div>
```

```scss

.mt-5 {
  margin-top: 5px;
}

.mt-10 {
  margin-top: 10px;
}

.mt-20 {
  margin-top: 20px;
}

.mt-40 {
  margin-top: 40px;
}

.mb-5 {
  margin-bottom: 5px;
}

.mb-10 {
  margin-bottom: 10px;
}

.mb-20 {
  margin-bottom: 20px;
}

.mb-30 {
  margin-bottom: 30px;
}

.mb-40 {
  margin-bottom: 40px;
}

.mr-5 {
  margin-right: 5px;
}

.mr-10 {
  margin-right: 10px;
}

.mr-20 {
  margin-right: 20px;
}

.mr-30 {
  margin-right: 30px;
}

.mr-40 {
  margin-right: 40px;
}

.mr-60 {
  margin-right: 60px;
}

.mr-100 {
  margin-right: 100px;
}

.ml-5 {
  margin-left: 5px;
}

.ml-10 {
  margin-left: 10px;
}

.ml-20 {
  margin-left: 20px;
}

.ml-30 {
  margin-left: 30px;
}

.font-emphasis {
  font-size: 16px;
  font-weight: 500;
}

.font-small {
  font-size: 13px;
}

.bg-p {
  padding: 10px;
  background-color: #f1f1ff;
  border-radius: 5px;
}

.essential-star {
  color: #ff6060;
}

.gray-word {
  color: #adafbc;
}

.loading-layout-for-category {
  z-index: 3000 !important;
}

.ellipsis-text-1 {
  display: -webkit-box;
  overflow: hidden;
  text-overflow: ellipsis;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1;
}

.ellipsis-text-2 {
  display: -webkit-box;
  overflow: hidden;
  text-overflow: ellipsis;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.ellipsis-text-3 {
  display: -webkit-box;
  overflow: hidden;
  text-overflow: ellipsis;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
}

.width-100 {
  width: 100%;
}

.flex {
  display: flex;
}

.flex-1 {
  flex: 1;
}

.purple-color {
  color: #626aef;
}

.font-thin {
  font-family: sans-serif;
}

a {
  color: #fff;
  text-decoration: none;
}
```
