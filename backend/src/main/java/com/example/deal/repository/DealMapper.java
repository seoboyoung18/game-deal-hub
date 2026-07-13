package com.example.deal.repository;

import java.math.BigDecimal;
import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.example.deal.domain.Deal;
import com.example.deal.domain.Game;
import com.example.deal.domain.Store;
import com.example.deal.dto.DealResponse;
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

    // ---- 서빙(읽기) ----

    /** 할인 목록 (정렬·필터·페이징). */
    List<DealResponse> findDeals(@Param("sort") String sort,
                                 @Param("storeId") String storeId,
                                 @Param("minPrice") BigDecimal minPrice,
                                 @Param("maxPrice") BigDecimal maxPrice,
                                 @Param("offset") int offset,
                                 @Param("size") int size);

    /** 필터 조건에 맞는 총 딜 수 (페이징 totalElements). */
    long countDealsFiltered(@Param("storeId") String storeId,
                            @Param("minPrice") BigDecimal minPrice,
                            @Param("maxPrice") BigDecimal maxPrice);

    /** 활성 스토어 목록. */
    List<StoreDto> findActiveStores();

    // ---- 검증/집계용 ----
    long countDeals();

    long countGames();

    long countStores();
}
