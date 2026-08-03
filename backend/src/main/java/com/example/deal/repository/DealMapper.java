package com.example.deal.repository;

import java.math.BigDecimal;
import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.example.deal.domain.Deal;
import com.example.deal.domain.Game;
import com.example.deal.domain.Store;
import com.example.deal.dto.DealResponse;
import com.example.deal.dto.SteamDealRef;
import com.example.deal.dto.StoreDto;

/**
 * MyBatis 매퍼. SQL 은 resources/mapper/DealMapper.xml.
 * 수집 저장 순서 주의: store → game → deal (FK).
 */
@Mapper
public interface DealMapper {

    // ---- 수집(쓰기) ----
    void upsertStore(Store store);

    void upsertGame(Game game);

    void upsertDeal(Deal deal);

    // ---- 스팀 KRW 보강 ----
    List<SteamDealRef> findSteamDealsForKrw(@Param("max") int max);

    void updateDealKrw(@Param("dealId") String dealId,
                       @Param("krwSale") BigDecimal krwSale,
                       @Param("krwNormal") BigDecimal krwNormal);

    // ---- 서빙(읽기) ----
    List<DealResponse> findDeals(@Param("sort") String sort,
                                 @Param("storeId") String storeId,
                                 @Param("minPrice") BigDecimal minPrice,
                                 @Param("maxPrice") BigDecimal maxPrice,
                                 @Param("offset") int offset,
                                 @Param("size") int size);

    long countDealsFiltered(@Param("storeId") String storeId,
                            @Param("minPrice") BigDecimal minPrice,
                            @Param("maxPrice") BigDecimal maxPrice);

    List<StoreDto> findActiveStores();

    // ---- 검증/집계 ----
    long countDeals();

    long countGames();

    long countStores();
}
