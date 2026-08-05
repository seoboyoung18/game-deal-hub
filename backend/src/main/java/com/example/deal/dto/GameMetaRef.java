package com.example.deal.dto;

import lombok.Data;

/** 스팀 메타 보강 대상 (games 중 steam_app_id 있고 아직 미보강). */
@Data
public class GameMetaRef {

    private String gameId;
    private String steamAppId;
}
