package com.example.deal.dto;

import lombok.Data;

/** 스팀 KRW 보강 대상: 딜 ID + 스팀 appId. */
@Data
public class SteamDealRef {
    private String dealId;
    private String steamAppId;
}
