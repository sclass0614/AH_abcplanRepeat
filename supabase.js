// Supabase 설정
const SUPABASE_URL = "https://dfomeijvzayyszisqflo.supabase.co";
const SUPABASE_API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRmb21laWp2emF5eXN6aXNxZmxvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ4NjYwNDIsImV4cCI6MjA2MDQ0MjA0Mn0.-r1iL04wvPNdBeIvgxqXLF2rWqIUX5Ot-qGQRdYo_qk";

// 테이블 이름 상수
const PLAN_TABLE = "activities_plan";
const EMPLOYEE_TABLE = "employeesinfo";
const ACTIVITYPIC_TABLE = "abc_activitypic";

// Supabase 클라이언트 초기화
let supabaseClient;

// Supabase 클라이언트 초기화 함수
function initSupabase() {
    if (!supabaseClient) {
        supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_API_KEY);
    }
    return supabaseClient;
}

// ✅ 전역으로 등록
window.supabase = initSupabase();

/**
 * 모든 계획 데이터를 가져오는 함수
 * @returns {Promise<Array>} 계획 데이터 배열
 */
async function getPlanAll() {
    try {
        const supabase = initSupabase();
        
        // 모든 필드 이름을 명시적으로 지정하여 쿼리
        const { data, error } = await supabase
            .from(PLAN_TABLE)
            .select(`
                계획_id,
                날짜,
                시작시간,
                종료시간,
                직원번호,
                직원명,
                활동명,
                생활영역,
                장소,
                준비물품,
                내용및특이사항,
                활동기록,
                참고사진url
            `)
            .order('날짜', { ascending: false });

        if (error) {
            console.error("Supabase 쿼리 오류:", error);
            throw error;
        }

        // 데이터 디버깅 - 첫 번째 항목의 모든 필드 이름과 값을 콘솔에 출력
        if (data && data.length > 0) {
            console.log("Supabase 원본 데이터 첫 번째 항목:");
            const firstItem = data[0];
            for (const key in firstItem) {
                console.log(`${key}: ${firstItem[key]}`);
            }
        } else {
            console.log("Supabase에서 가져온 데이터가 없습니다.");
        }

        // 날짜와 시간 형식 변환
        const formattedData = data.map(plan => {
            // 날짜를 문자열로 변환
            const dateStr = plan.날짜 ? plan.날짜.toString() : "0";
            
            // 시작시간과 종료시간 - 이제 텍스트로 저장되므로 그대로 사용
            const startTimeStr = plan.시작시간 ? plan.시작시간.toString() : "0000";
            const endTimeStr = plan.종료시간 ? plan.종료시간.toString() : "0000";
            
            // 시간 형식 - 4자리가 되도록 앞에 0 채우기
            const formattedStartTime = startTimeStr.padStart(4, '0');
            const formattedEndTime = endTimeStr.padStart(4, '0');

            // 모든 필드 값을 명시적으로 출력
            return [
                String(plan.계획_id || ""),   // ID가 null이면 빈 문자열
                dateStr,
                formattedStartTime,           // 작은따옴표 제거
                formattedEndTime,             // 작은따옴표 제거
                String(plan.직원번호 || ""),
                String(plan.직원명 || ""),
                String(plan.활동명 || ""),
                String(plan.생활영역 || ""),
                String(plan.장소 || ""),
                String(plan.준비물품 || ""),
                String(plan.내용및특이사항 || ""),
                String(plan.활동기록 || ""),
                String(plan.참고사진url || "")
            ];
        });

        console.log("변환 후 데이터:", formattedData);
        return formattedData;
    } catch (error) {
        console.error("오류 발생:", error);
        return [];
    }
}

/**
 * 모든 직원 정보를 가져오는 함수
 * @returns {Promise<Array>} 직원 정보 배열
 */
async function getAllEmployees() {
    try {
        const supabase = initSupabase();
        const { data, error } = await supabase
            .from(EMPLOYEE_TABLE)
            .select('직원번호, 직원명, 계약시작일, 계약종료일');

        if (error) throw error;

        // 필요한 데이터만 추출하여 배열 형태로 변환
        const employeeData = data.map(employee => {
            // 계약 시작일과 종료일을 문자열로 변환 (숫자 형식으로 저장되어 있음)
            let startDate = '';
            if (employee.계약시작일) {
                let startDateNum = employee.계약시작일;
                if (typeof startDateNum !== 'number') {
                    startDateNum = parseInt(startDateNum);
                }
                startDate = startDateNum.toString();
            }
            
            let endDate = '';
            if (employee.계약종료일) {
                let endDateNum = employee.계약종료일;
                if (typeof endDateNum !== 'number') {
                    endDateNum = parseInt(endDateNum);
                }
                endDate = endDateNum.toString();
            }
            
            return [
                employee.직원번호,
                employee.직원명,
                startDate,
                endDate
            ];
        });

        // 헤더 행 추가 (스프레드시트 형식과 동일하게)
        employeeData.unshift(['직원번호', '직원명', '계약시작일', '계약종료일']);
        
        console.log("직원 데이터:", employeeData);
        return employeeData;
    } catch (error) {
        console.error("직원 데이터 로드 오류:", error);
        return [];
    }
}

/**
 * 새로운 계획을 데이터베이스에 추가하는 함수
 * @param {Array} planData - 저장할 계획 데이터 배열
 * @return {Promise<boolean>} 저장 성공 여부
 */
async function appendPlan(planData) {
    try {
        const supabase = initSupabase();
        
        // 날짜 형식 변환 (문자열 → 숫자)
        const dateStr = planData[1].replace(/-/g, "");
        
        // 시간 형식 변환 (작은따옴표가 있으면 제거)
        let startTime = planData[2];
        let endTime = planData[3];
        
        // 혹시 작은따옴표가 있으면 제거
        if (startTime.startsWith("'")) {
            startTime = startTime.substring(1);
        }
        
        if (endTime.startsWith("'")) {
            endTime = endTime.substring(1);
        }
        
        // Supabase 테이블 구조에 맞게 데이터 구성
        const data = {
            // 계획_id는 자동 생성되므로 생략
            날짜: parseInt(dateStr) || 0,
            시작시간: startTime || "0000",    // 텍스트로 저장
            종료시간: endTime || "0000",      // 텍스트로 저장
            직원번호: planData[4] || "",
            직원명: planData[5] || "",
            활동명: planData[6] || "",
            생활영역: planData[7] || "",
            장소: planData[8] || "",
            준비물품: planData[9] || "",
            내용및특이사항: planData[10] || "",
            활동기록: planData[11] || "",
            참고사진url: planData[12] || ""
        };
        
        // 데이터 저장 전 디버깅
        console.log("저장할 데이터:", data);
        
        const { error } = await supabase
            .from(PLAN_TABLE)
            .insert([data]);
            
        if (error) throw error;
        
        return true;
    } catch (error) {
        console.error("계획 저장 오류:", error);
        throw new Error("계획 저장 중 오류가 발생했습니다: " + error.message);
    }
}

/**
 * 특정 계획_ID를 가진 행을 삭제하는 함수
 * @param {string} planId - 삭제할 계획의 ID
 * @return {Promise<boolean>} 삭제 성공 여부
 */
async function deletePlanrow(planId) {
    try {
        const supabase = initSupabase();
        
        const { error } = await supabase
            .from(PLAN_TABLE)
            .delete()
            .eq('계획_id', planId);
            
        if (error) throw error;
        
        return true;
    } catch (error) {
        console.error("계획 삭제 오류:", error);
        throw new Error("삭제 중 오류가 발생했습니다: " + error.message);
    }
}

/**
 * 특정 계획_ID를 가진 행의 데이터를 수정하는 함수
 * @param {string} planId - 수정할 계획의 ID
 * @param {Array} planData - 수정할 계획 데이터 배열
 * @return {Promise<boolean>} 수정 성공 여부
 */
async function updatePlan(planId, planData) {
    try {
        const supabase = initSupabase();
        
        // 날짜 형식 변환 (문자열 → 숫자)
        const dateStr = planData[1].replace(/-/g, "");
        
        // 시간 형식 변환 (작은따옴표가 있으면 제거)
        let startTime = planData[2];
        let endTime = planData[3];
        
        // 혹시 작은따옴표가 있으면 제거
        if (startTime.startsWith("'")) {
            startTime = startTime.substring(1);
        }
        
        if (endTime.startsWith("'")) {
            endTime = endTime.substring(1);
        }
        
        // Supabase 테이블 구조에 맞게 데이터 구성
        const data = {
            // 계획_id는 변경하지 않음
            날짜: parseInt(dateStr) || 0,
            시작시간: startTime || "0000",    // 텍스트로 저장
            종료시간: endTime || "0000",      // 텍스트로 저장
            직원번호: planData[4] || "",
            직원명: planData[5] || "",
            활동명: planData[6] || "",
            생활영역: planData[7] || "",
            장소: planData[8] || "",
            준비물품: planData[9] || "",
            내용및특이사항: planData[10] || "",
            활동기록: planData[11] || "",
            참고사진url: planData[12] || ""
        };
        
        // 데이터 업데이트 전 디버깅
        console.log("업데이트할 데이터:", data);
        console.log("업데이트할 계획 ID:", planId);
        
        const { error } = await supabase
            .from(PLAN_TABLE)
            .update(data)
            .eq('계획_id', planId);
            
        if (error) throw error;
        
        return true;
    } catch (error) {
        console.error("계획 수정 오류:", error);
        throw new Error("수정 중 오류가 발생했습니다: " + error.message);
    }
}

/**
 * 활동 사진 URL 데이터를 가져오는 함수
 * @returns {Promise<Array>} 활동 사진 데이터 배열
 */
async function fetchActivityPics() {
  const supabase = initSupabase();
  try {
    const { data, error } = await supabase
      .from(ACTIVITYPIC_TABLE)
      .select('pic_id, 활동명, url주소, created_at');
      
    if (error) {
      console.error('데이터 가져오기 오류:', error);
      return [];
    }
    return data;
  } catch (error) {
    console.error('활동 사진 데이터 로드 중 예외 발생:', error);
    return [];
  }
}

/**
 * 새로운 활동 사진 URL을 추가하는 함수
 * @param {string} activityName - 활동명
 * @param {string} picUrl - 사진 URL
 * @returns {Promise<Object|boolean>} 저장된 데이터 또는 실패 시 false
 */
async function addActivityPic(activityName, picUrl) {
  const supabase = initSupabase();
  try {
    const { data, error } = await supabase
      .from(ACTIVITYPIC_TABLE)
      .insert([
        { 
          활동명: activityName, 
          url주소: picUrl 
        }
      ])
      .select();
      
    if (error) {
      console.error('데이터 추가 오류:', error);
      return false;
    }
    return data;
  } catch (error) {
    console.error('활동 사진 추가 중 예외 발생:', error);
    return false;
  }
}

/**
 * 활동 사진 URL 데이터를 수정하는 함수
 * @param {number|string} id - 수정할 항목의 ID
 * @param {string} activityName - 새로운 활동명
 * @param {string} picUrl - 새로운 사진 URL
 * @returns {Promise<Object|boolean>} 수정된 데이터 또는 실패 시 false
 */
async function updateActivityPic(id, activityName, picUrl) {
  const supabase = initSupabase();
  try {
    const { data, error } = await supabase
      .from(ACTIVITYPIC_TABLE)
      .update({ 
        활동명: activityName, 
        url주소: picUrl 
      })
      .eq('pic_id', id)
      .select();
      
    if (error) {
      console.error('데이터 수정 오류:', error);
      return false;
    }
    return data;
  } catch (error) {
    console.error('활동 사진 수정 중 예외 발생:', error);
    return false;
  }
}

/**
 * 활동 사진 URL 데이터를 삭제하는 함수
 * @param {number|string} id - 삭제할 항목의 ID
 * @returns {Promise<boolean>} 삭제 성공 여부
 */
async function deleteActivityPic(id) {
  const supabase = initSupabase();
  try {
    const { error } = await supabase
      .from(ACTIVITYPIC_TABLE)
      .delete()
      .eq('pic_id', id);
      
    if (error) {
      console.error('데이터 삭제 오류:', error);
      return false;
    }
    return true;
  } catch (error) {
    console.error('활동 사진 삭제 중 예외 발생:', error);
    return false;
  }
} 
