package com.example.deal.dto;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;

/**
 * 페이징 응답 래퍼. 명세의 { content, page, size, totalElements, totalPages } 구조.
 */
@Data
@AllArgsConstructor
public class PageResponse<T> {

    private List<T> content;
    private int page;
    private int size;
    private long totalElements;
    private int totalPages;

    public static <T> PageResponse<T> of(List<T> content, int page, int size, long totalElements) {
        int totalPages = size > 0 ? (int) Math.ceil((double) totalElements / size) : 0;
        return new PageResponse<>(content, page, size, totalElements, totalPages);
    }
}
