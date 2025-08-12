const SUPABASE_URL = "https://dfomeijvzayyszisqflo.supabase.co";
const SUPABASE_API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRmb21laWp2emF5eXN6aXNxZmxvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ4NjYwNDIsImV4cCI6MjA2MDQ0MjA0Mn0.-r1iL04wvPNdBeIvgxqXLF2rWqIUX5Ot-qGQRdYo_qk";

const PLAN_TABLE = "activities_plan";
const EMPLOYEE_TABLE = "employeesinfo";
const ACTIVITYPIC_TABLE = "abc_activitypic";

let supabaseClient;

function initSupabase() {
    if (!supabaseClient) {
        supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_API_KEY);
    }
    return supabaseClient;
}

window.supabase = initSupabase();

async function getPlanAll() {
    try {
        const supabase = initSupabase();
        
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
            throw error;
        }

        const formattedData = data.map(plan => {
            const dateStr = plan.날짜 ? plan.날짜.toString() : "0";
            
            const startTimeStr = plan.시작시간 ? plan.시작시간.toString() : "0000";
            const endTimeStr = plan.종료시간 ? plan.종료시간.toString() : "0000";
            
            const formattedStartTime = startTimeStr.padStart(4, '0');
            const formattedEndTime = endTimeStr.padStart(4, '0');

            return [
                String(plan.계획_id || ""),
                dateStr,
                formattedStartTime,
                formattedEndTime,
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

        return formattedData;
    } catch (error) {
        return [];
    }
}

async function getAllEmployees() {
    try {
        const supabase = initSupabase();
        const { data, error } = await supabase
            .from(EMPLOYEE_TABLE)
            .select('직원번호, 직원명, 계약시작일, 계약종료일');

        if (error) throw error;

        const employeeData = data.map(employee => {
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

        employeeData.unshift(['직원번호', '직원명', '계약시작일', '계약종료일']);
        
        return employeeData;
    } catch (error) {
        return [];
    }
}

async function appendPlan(planData) {
    try {
        const supabase = initSupabase();
        
        const dateStr = planData[1].replace(/-/g, "");
        
        let startTime = planData[2];
        let endTime = planData[3];
        
        if (startTime.startsWith("'")) {
            startTime = startTime.substring(1);
        }
        
        if (endTime.startsWith("'")) {
            endTime = endTime.substring(1);
        }
        
        const data = {
            날짜: parseInt(dateStr) || 0,
            시작시간: startTime || "0000",
            종료시간: endTime || "0000",
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
        
        const { error } = await supabase
            .from(PLAN_TABLE)
            .insert([data]);
            
        if (error) throw error;
        
        return true;
    } catch (error) {
        throw new Error("계획 저장 중 오류가 발생했습니다: " + error.message);
    }
}

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
        throw new Error("삭제 중 오류가 발생했습니다: " + error.message);
    }
}

async function updatePlan(planId, planData) {
    try {
        const supabase = initSupabase();
        
        const dateStr = planData[1].replace(/-/g, "");
        
        let startTime = planData[2];
        let endTime = planData[3];
        
        if (startTime.startsWith("'")) {
            startTime = startTime.substring(1);
        }
        
        if (endTime.startsWith("'")) {
            endTime = endTime.substring(1);
        }
        
        const data = {
            날짜: parseInt(dateStr) || 0,
            시작시간: startTime || "0000",
            종료시간: endTime || "0000",
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
        
        const { error } = await supabase
            .from(PLAN_TABLE)
            .update(data)
            .eq('계획_id', planId);
            
        if (error) throw error;
        
        return true;
    } catch (error) {
        throw new Error("수정 중 오류가 발생했습니다: " + error.message);
    }
}

async function fetchActivityPics() {
  const supabase = initSupabase();
  try {
    const { data, error } = await supabase
      .from(ACTIVITYPIC_TABLE)
      .select('pic_id, 활동명, url주소, created_at');
      
    if (error) {
      return [];
    }
    return data;
  } catch (error) {
    return [];
  }
}

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
      return false;
    }
    return data;
  } catch (error) {
    return false;
  }
}

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
      return false;
    }
    return data;
  } catch (error) {
    return false;
  }
}

async function deleteActivityPic(id) {
  const supabase = initSupabase();
  try {
    const { error } = await supabase
      .from(ACTIVITYPIC_TABLE)
      .delete()
      .eq('pic_id', id);
      
    if (error) {
      return false;
    }
    return true;
  } catch (error) {
    return false;
  }
}
